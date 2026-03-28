import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { LangSwitcher } from "../components/lang-switcher";
import { api, AppointmentItem, PatientItem, AdminStats } from "../lib/api";
import { useAuthStore } from "../lib/auth-store";

type Tab = "dashboard" | "schedule" | "patients" | "crm";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700",
  waiting:   "bg-yellow-100 text-yellow-700",
  inchair:   "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full" />
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 30;
  const pts = data.map((v, i) => `${(i / Math.max(data.length - 1, 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Schedule grid (drag & drop) ──────────────────────────────────────────
function ScheduleGrid({ appointments: initial }: { appointments: AppointmentItem[] }) {
  const { t } = useTranslation();
  const [appts, setAppts] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => { setAppts(initial); }, [initial]);

  // Get unique dates from appointments (sorted)
  const dates = [...new Set(appts.map(a => a.appointment.date))].sort().slice(0, 4);

  const handleDrop = async (date: string) => {
    if (!dragId) return;
    try {
      await api.patch(`/api/appointments/${dragId}`, { date });
      setAppts(prev => prev.map(a =>
        a.appointment.id === dragId ? { ...a, appointment: { ...a.appointment, date } } : a
      ));
    } catch (e: any) {
      alert("Reschedule failed: " + e.message);
    }
    setDragId(null);
  };

  return (
    <div>
      <div className="text-sm text-muted-foreground mb-4">{t("admin.dragHint")}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dates.map(date => (
          <div key={date}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(date)}
            className="min-h-[200px]">
            <div className="sticky top-0 bg-muted/80 backdrop-blur rounded-xl px-4 py-3 mb-3 font-semibold text-sm text-foreground border border-border">
              {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              <span className="ml-2 text-xs text-muted-foreground">
                ({appts.filter(a => a.appointment.date === date).length})
              </span>
            </div>
            <div className="space-y-3">
              {appts.filter(a => a.appointment.date === date)
                .sort((a, b) => a.appointment.time.localeCompare(b.appointment.time))
                .map(apt => (
                  <motion.div key={apt.appointment.id}
                    layout draggable
                    onDragStart={() => setDragId(apt.appointment.id)}
                    whileHover={{ scale: 1.02 }} whileDrag={{ scale: 1.05, opacity: 0.8 }}
                    className="glass rounded-xl p-4 border-2 border-border hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-muted-foreground">{apt.appointment.time.slice(0, 5)}</span>
                      <Badge className={cn("text-[10px] py-0", STATUS_COLORS[apt.appointment.status])}>{apt.appointment.status}</Badge>
                    </div>
                    <div className="font-semibold text-sm text-foreground">{apt.patientUser.fullName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{apt.service.name}</div>
                    <div className="text-xs text-primary mt-1">
                      {apt.doctorUser.fullName.replace("Dr. ", "")} {apt.appointment.room ? `· Room ${apt.appointment.room}` : ""}
                    </div>
                  </motion.div>
                ))}
              {appts.filter(a => a.appointment.date === date).length === 0 && (
                <div className="h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  {t("admin.dropHere")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CRM table ────────────────────────────────────────────────────────────
function CRMTable({ patients }: { patients: PatientItem[] }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = patients.filter(p =>
    p.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (p.user.phone ?? "").includes(search) ||
    p.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t("admin.search")}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
      </div>
      <div className="glass rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Patient", "Contact", t("admin.lastVisit"), t("admin.nextVisit"), "Balance", "Notes", ""].map(h => (
                  <th key={h} className="sticky top-0 text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((p, i) => (
                  <motion.tr key={p.patient.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onMouseEnter={() => setHoveredRow(p.patient.id)} onMouseLeave={() => setHoveredRow(null)}
                    className={cn("border-b border-border/50 transition-colors cursor-pointer",
                      hoveredRow === p.patient.id ? "bg-primary/5" : "hover:bg-muted/30"
                    )}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.user.avatarUrl ?? `https://api.dicebear.com/9.x/personas/svg?seed=${p.user.email}`}
                          alt={p.user.fullName} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <div className="font-medium text-foreground text-sm">{p.user.fullName}</div>
                          {p.patient.dateOfBirth && <div className="text-xs text-muted-foreground">DOB: {p.patient.dateOfBirth}</div>}
                          {p.patient.isVip && <Badge className="text-[10px] bg-yellow-100 text-yellow-700 mt-0.5">VIP</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-xs text-muted-foreground">{p.user.phone}</div>
                      <div className="text-xs text-muted-foreground">{p.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">—</td>
                    <td className="px-4 py-3 text-xs text-foreground hidden md:table-cell">—</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-sm font-medium",
                        Number(p.patient.balance) > 0 ? "text-red-600" : Number(p.patient.balance) < 0 ? "text-green-600" : "text-muted-foreground"
                      )}>
                        {Number(p.patient.balance) === 0 ? "—"
                          : Number(p.patient.balance) > 0 ? `${t("admin.owes")} $${p.patient.balance}`
                          : `${t("admin.credit")} $${Math.abs(Number(p.patient.balance))}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {p.patient.medicalNotes || p.patient.allergies ? (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                          ⚠ {p.patient.medicalNotes || p.patient.allergies}
                        </span>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" className="text-xs h-7 border-primary/30 text-primary hover:bg-primary/5">
                        {t("common.view")}
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          {filtered.length} {t("admin.of")} {patients.length} {t("admin.patients")}
        </div>
      </div>
    </div>
  );
}

// ─── Main admin panel ─────────────────────────────────────────────────────
export default function AdminPanel() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [, navigate] = useLocation();
  const { user, logout, meLoaded, fetchMe } = useAuthStore();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [liveAlert, setLiveAlert] = useState(true);

  // Hydrate from token once on mount
  useEffect(() => {
    if (!meLoaded) { fetchMe(); }
  }, []);

  useEffect(() => {
    if (!meLoaded) return;
    if (!user) { navigate("/login"); return; }
    api.get<AdminStats>("/api/admin/stats")
      .then(setStats)
      .finally(() => setLoadingStats(false));
  }, [user, meLoaded]);

  useEffect(() => {
    if (tab === "schedule" && appointments.length === 0) {
      setLoadingAppts(true);
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      api.get<AppointmentItem[]>(`/api/admin/schedule?from=${today}&to=${nextWeek}`)
        .then(setAppointments)
        .finally(() => setLoadingAppts(false));
    }
  }, [tab]);

  useEffect(() => {
    if ((tab === "patients" || tab === "crm") && patients.length === 0) {
      setLoadingPatients(true);
      api.get<PatientItem[]>("/api/patients")
        .then(setPatients)
        .finally(() => setLoadingPatients(false));
    }
  }, [tab]);

  const tabs = [
    { id: "dashboard" as Tab, label: t("admin.tabs.dashboard"), icon: "📊" },
    { id: "schedule" as Tab,  label: t("admin.tabs.schedule"),  icon: "📅" },
    { id: "patients" as Tab,  label: t("admin.tabs.patients"),  icon: "👥" },
    { id: "crm" as Tab,       label: t("admin.tabs.crm"),       icon: "💼" },
  ];

  const revenueSparkData = [2100, 3400, 2800, stats?.weekRevenue ?? 4250, 3900, 5100, stats?.weekRevenue ?? 4250];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.aside initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-8 px-2 pt-2">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-xl">🦷</div>
            <div>
              <div className="font-bold font-[family-name:var(--font-display)] text-sm">Andreasyan</div>
              <div className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Admin</div>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={cn("nav-item w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left",
                  tab === tb.id && "active"
                )}>
                <span className="text-base">{tb.icon}</span>
                <span>{tb.label}</span>
              </button>
            ))}
          </nav>
          <div className="pt-4 border-t border-sidebar-border space-y-1">
            <button className="nav-item w-full flex items-center gap-3 px-3 py-2.5 text-sm text-sidebar-foreground/70">
              <span>⚙️</span><span>{t("admin.settings")}</span>
            </button>
            <button onClick={() => navigate("/")} className="nav-item w-full flex items-center gap-3 px-3 py-2.5 text-sm text-sidebar-foreground/70">
              <span>🌐</span><span>{t("admin.viewWebsite")}</span>
            </button>
            <button onClick={() => { logout(); navigate("/login"); }}
              className="nav-item w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400">
              <span>🚪</span><span>{t("admin.signOut")}</span>
            </button>
          </div>
        </motion.aside>

        {/* Main */}
        <div className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-40 glass border-b border-border px-4 md:px-6 h-14 flex items-center justify-between">
            <div className="text-sm font-medium text-foreground capitalize hidden md:block">{tab}</div>
            <div className="md:hidden font-bold font-[family-name:var(--font-display)]">{t("admin.panel")}</div>
            <div className="flex items-center gap-3">
              <LangSwitcher />
              <Button size="sm" onClick={() => navigate("/book")} className="bg-primary text-white text-xs hidden sm:flex">
                {t("admin.addAppt")}
              </Button>
              <div className="relative">
                {liveAlert && <div className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5" />}
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center cursor-pointer">🔔</div>
              </div>
            </div>
          </div>

          {/* Live alert */}
          <AnimatePresence>
            {liveAlert && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="mx-4 md:mx-6 mt-4 p-3 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⚡</span>
                  <span className="text-yellow-800 font-medium">{t("admin.liveAlert")}</span>
                </div>
                <button onClick={() => setLiveAlert(false)} className="text-yellow-500 hover:text-yellow-700 ml-4 text-lg leading-none">×</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-4 md:p-6">
            {/* Mobile tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 overflow-x-auto md:hidden">
              {tabs.map(tb => (
                <button key={tb.id} onClick={() => setTab(tb.id)}
                  className={cn("flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    tab === tb.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                  )}>
                  <span>{tb.icon}</span><span>{tb.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

                {/* ── Dashboard ── */}
                {tab === "dashboard" && (
                  <div className="space-y-6">
                    {loadingStats ? <Spinner /> : (
                      <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: t("admin.kpis.todayAppts"), value: stats?.todayAppointments ?? 0, icon: "📅", trend: [6,7,5,8,9,7,stats?.todayAppointments??0], color: "#0B6E72" },
                            { label: t("admin.kpis.weekRevenue"), value: `$${(stats?.weekRevenue ?? 0).toLocaleString()}`, icon: "💰", trend: revenueSparkData, color: "#C9A84C" },
                            { label: t("admin.kpis.monthPatients"), value: `${stats?.monthAppointments ?? 0} appts`, icon: "👥", trend: [28,32,35,38,42,45,stats?.monthAppointments??0], color: "#14A0A6" },
                            { label: t("admin.kpis.satisfaction"), value: "98%", icon: "⭐", trend: [95,96,97,97,98,98,98], color: "#10b981" },
                          ].map(kpi => (
                            <motion.div key={kpi.label} whileHover={{ y: -4 }}
                              className="glass rounded-2xl p-5 border border-border">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-2xl mb-2">{kpi.icon}</div>
                                  <div className="text-2xl font-bold font-[family-name:var(--font-display)]" style={{ color: kpi.color }}>
                                    {kpi.value}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
                                </div>
                                <Sparkline data={kpi.trend} color={kpi.color} />
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Quick today view */}
                        <div className="glass rounded-2xl p-5 border border-border">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground font-[family-name:var(--font-display)]">{t("admin.todayAppts")}</h3>
                            <Button size="sm" variant="ghost" className="text-xs text-primary"
                              onClick={() => setTab("schedule")}>{t("admin.viewAll")}</Button>
                          </div>
                          {appointments.slice(0, 5).map(apt => (
                            <div key={apt.appointment.id}
                              className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                              <div className="text-xs font-mono text-muted-foreground w-10">{apt.appointment.time.slice(0, 5)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">{apt.patientUser.fullName}</div>
                                <div className="text-xs text-muted-foreground truncate">{apt.service.name}</div>
                              </div>
                              <Badge className={cn("text-[10px]", STATUS_COLORS[apt.appointment.status])}>{apt.appointment.status}</Badge>
                            </div>
                          ))}
                          {appointments.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Load schedule tab to see appointments.</p>
                          )}
                        </div>

                        {/* Weekly revenue bars */}
                        <div className="glass rounded-2xl p-5 border border-border">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-foreground font-[family-name:var(--font-display)]">{t("admin.weeklyRevenue")}</h3>
                            <Badge className="bg-green-100 text-green-700 text-xs">{t("admin.revenueTrend")}</Badge>
                          </div>
                          <div className="flex items-end gap-2 h-32">
                            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => {
                              const h = (revenueSparkData[i] / Math.max(...revenueSparkData)) * 100;
                              return (
                                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                                  <motion.div
                                    initial={{ height: 0 }} animate={{ height: `${h}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                                    className="w-full rounded-t-lg"
                                    style={{ background: i === 3 ? "#0B6E72" : "oklch(0.48 0.09 195 / 0.4)" }}
                                  />
                                  <span className="text-[10px] text-muted-foreground">{day}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── Schedule ── */}
                {tab === "schedule" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">{t("admin.scheduleTitle")}</h2>
                      <Button size="sm" onClick={() => navigate("/book")} className="bg-primary text-white text-xs">{t("admin.addAppt")}</Button>
                    </div>
                    {loadingAppts ? <Spinner /> : <ScheduleGrid appointments={appointments} />}
                  </div>
                )}

                {/* ── Patients ── */}
                {tab === "patients" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">{t("admin.patientsTitle")}</h2>
                    </div>
                    {loadingPatients ? <Spinner /> : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patients.map((p, i) => (
                          <motion.div key={p.patient.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            whileHover={{ y: -4 }}
                            className="glass rounded-2xl p-5 border border-border hover:border-primary/30 transition-all cursor-pointer">
                            <div className="flex gap-3 items-center mb-3">
                              <img src={p.user.avatarUrl ?? `https://api.dicebear.com/9.x/personas/svg?seed=${p.user.email}`}
                                alt={p.user.fullName} className="w-12 h-12 rounded-xl object-cover" />
                              <div>
                                <div className="font-semibold text-sm text-foreground">{p.user.fullName}</div>
                                <div className="text-xs text-muted-foreground">{p.user.phone}</div>
                              </div>
                              {Number(p.patient.balance) > 0 && <div className="ml-auto w-2 h-2 rounded-full bg-red-400" />}
                              {p.patient.isVip && <Badge className="text-[10px] bg-yellow-100 text-yellow-700">VIP</Badge>}
                            </div>
                            {p.patient.medicalNotes && (
                              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mt-1">⚠ {p.patient.medicalNotes}</div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── CRM ── */}
                {tab === "crm" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">{t("admin.crmTitle")}</h2>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">{t("admin.exportCsv")}</Button>
                      </div>
                    </div>
                    {loadingPatients ? <Spinner /> : <CRMTable patients={patients} />}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
