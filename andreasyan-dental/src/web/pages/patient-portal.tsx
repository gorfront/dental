import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { LangSwitcher } from "../components/lang-switcher";
import { api, AppointmentItem, ToothItem, XRayItem, PatientItem, MeResponse } from "../lib/api";
import { useAuthStore } from "../lib/auth-store";

type Tab = "dashboard" | "appointments" | "dental-chart" | "records";
type ToothStatus = "healthy" | "cavity" | "filling" | "crown" | "missing";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700",
  waiting: "bg-yellow-100 text-yellow-700",
  inchair: "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const TOOTH_POSITIONS: Record<number, { x: number; y: number }> = {
  18: { x: 30, y: 30 }, 17: { x: 80, y: 20 }, 16: { x: 130, y: 15 }, 15: { x: 178, y: 12 },
  14: { x: 220, y: 10 }, 13: { x: 258, y: 8 }, 12: { x: 290, y: 10 }, 11: { x: 318, y: 14 },
  21: { x: 346, y: 14 }, 22: { x: 374, y: 10 }, 23: { x: 406, y: 8 }, 24: { x: 444, y: 10 },
  25: { x: 486, y: 12 }, 26: { x: 530, y: 15 }, 27: { x: 580, y: 20 }, 28: { x: 630, y: 30 },
  48: { x: 30, y: 140 }, 47: { x: 80, y: 150 }, 46: { x: 130, y: 155 }, 45: { x: 178, y: 158 },
  44: { x: 220, y: 160 }, 43: { x: 258, y: 162 }, 42: { x: 290, y: 160 }, 41: { x: 318, y: 156 },
  31: { x: 346, y: 156 }, 32: { x: 374, y: 160 }, 33: { x: 406, y: 162 }, 34: { x: 444, y: 160 },
  35: { x: 486, y: 158 }, 36: { x: 530, y: 155 }, 37: { x: 580, y: 150 }, 38: { x: 630, y: 140 },
};

const STATUS_FILL: Record<string, string> = {
  healthy: "#e8f5f5", cavity: "#fde8e8", filling: "#e8f0fe",
  crown: "#fef9e8", missing: "#f3f4f6", implant: "#f0e8fe",
  bridge: "#e8fee8", root_canal: "#fee8f0",
};
const STATUS_STROKE: Record<string, string> = {
  healthy: "#0B6E72", cavity: "#dc2626", filling: "#2563eb",
  crown: "#C9A84C", missing: "#9ca3af", implant: "#7c3aed",
  bridge: "#16a34a", root_canal: "#db2777",
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
    </div>
  );
}

// ─── Tooth chart (reads from API data) ────────────────────────────────────
function ToothChart({ patientId }: { patientId: string }) {
  const { t } = useTranslation();
  const [teeth, setTeeth] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<ToothStatus>("healthy");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ToothItem[]>(`/api/patients/${patientId}/tooth-chart`)
      .then(data => {
        const map: Record<number, string> = {};
        data.forEach(t => { map[t.toothNumber] = t.status; });
        setTeeth(map);
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  const handleApply = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/api/patients/${patientId}/tooth-chart/${selected}`, { status: editStatus });
      setTeeth(prev => ({ ...prev, [selected]: editStatus }));
    } finally {
      setSaving(false);
    }
  };

  const legendItems = [
    { status: "healthy" as ToothStatus, label: t("patient.toothStatus.healthy") },
    { status: "cavity" as ToothStatus, label: t("patient.toothStatus.cavity") },
    { status: "filling" as ToothStatus, label: t("patient.toothStatus.filling") },
    { status: "crown" as ToothStatus, label: t("patient.toothStatus.crown") },
    { status: "missing" as ToothStatus, label: t("patient.toothStatus.missing") },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {legendItems.map(l => (
          <div key={l.status} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm border"
              style={{ background: STATUS_FILL[l.status], borderColor: STATUS_STROKE[l.status] }} />
            <span className="text-xs text-muted-foreground capitalize">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 border border-border overflow-x-auto">
        <svg viewBox="0 60 680 110" className="w-full min-w-[500px]" style={{ height: 160 }}>
          <line x1="332" y1="0" x2="332" y2="200" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
          <line x1="0" y1="90" x2="680" y2="90" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
          {Object.entries(TOOTH_POSITIONS).map(([idStr, pos]) => {
            const id = Number(idStr);
            const status = teeth[id] || "healthy";
            const isSel = selected === id;
            const big = [16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48].includes(id);
            return (
              <g key={id} onClick={() => setSelected(isSel ? null : id)} style={{ cursor: "pointer" }}>
                <rect x={pos.x} y={pos.y} width={big ? 34 : 26} height={big ? 30 : 26} rx="4"
                  fill={isSel ? "oklch(0.48 0.09 195 / 0.25)" : (STATUS_FILL[status] ?? STATUS_FILL.healthy)}
                  stroke={isSel ? "#0B6E72" : (STATUS_STROKE[status] ?? STATUS_STROKE.healthy)}
                  strokeWidth={isSel ? 2.5 : 1.5}
                  strokeDasharray={status === "missing" ? "3" : "none"}
                  style={{ transition: "all 0.3s" }} />
                <text x={pos.x + (big ? 17 : 13)} y={pos.y + 17} fontSize="7"
                  fill={STATUS_STROKE[status] ?? STATUS_STROKE.healthy} textAnchor="middle">{id}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-4 border border-primary/20 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">Tooth #{selected}</span>
              <Badge className="text-xs">{teeth[selected] ?? "healthy"}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {legendItems.map(l => (
                <button key={l.status} onClick={() => setEditStatus(l.status)}
                  className={cn("px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                    editStatus === l.status ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                  )}>{l.label}</button>
              ))}
            </div>
            <Button size="sm" onClick={handleApply} disabled={saving} className="bg-primary text-white text-xs">
              {saving ? "Saving…" : t("common.apply")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main portal ──────────────────────────────────────────────────────────
export default function PatientPortal() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [, navigate] = useLocation();
  const { user, patientId, meLoaded, fetchMe } = useAuthStore();

  // All data
  const [profile, setProfile] = useState<PatientItem | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [xrays, setXrays] = useState<XRayItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Step 1: hydrate store from token if not yet loaded
  useEffect(() => {
    if (!meLoaded) { fetchMe(); }
  }, []); // once on mount

  // Step 2: load data once we have user + patientId
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!meLoaded) return; // wait for fetchMe

    const id = patientId;
    if (!id) {
      // Logged in but no patient profile (e.g. doctor visiting wrong route)
      setLoading(false);
      return;
    }

    Promise.all([
      api.get<PatientItem>(`/api/patients/${id}`),
      api.get<AppointmentItem[]>(`/api/patients/${id}/appointments`),
    ]).then(([p, a]) => {
      setProfile(p);
      setAppointments(a);
    }).finally(() => setLoading(false));
  }, [user, patientId, meLoaded]);

  // Load xrays when tab selected
  useEffect(() => {
    if (tab === "records" && patientId && xrays.length === 0) {
      api.get<XRayItem[]>(`/api/patients/${patientId}/xrays`)
        .then(data => setXrays(data));
    }
  }, [tab, patientId]);

  const tabs = [
    { id: "dashboard" as Tab, label: t("patient.tabs.dashboard"), icon: "🏠" },
    { id: "appointments" as Tab, label: t("patient.tabs.appointments"), icon: "📅" },
    { id: "dental-chart" as Tab, label: t("patient.tabs.dentalChart"), icon: "🦷" },
    { id: "records" as Tab, label: t("patient.tabs.xrays"), icon: "📋" },
  ];

  const today = new Date().toISOString().split("T")[0];
  const nextAppt = appointments.find(a =>
    a.appointment.date >= today && a.appointment.status !== "cancelled"
  );

  const avatarUrl = profile?.user.avatarUrl
    ?? `https://api.dicebear.com/9.x/personas/svg?seed=${user?.email}&backgroundColor=0B6E72`;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <motion.header initial={{ y: -60 }} animate={{ y: 0 }}
        className="sticky top-0 z-40 glass border-b border-border px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")}
            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">🦷</button>
          <span className="font-semibold text-foreground hidden sm:block">Andreasyan Dental</span>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{t("patient.portal")}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <Button size="sm" onClick={() => navigate("/book")} className="bg-primary text-white text-xs">{t("common.book")}</Button>
          <img src={avatarUrl} alt={user?.fullName} className="w-8 h-8 rounded-full border-2 border-primary/30" />
        </div>
      </motion.header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-foreground">
            {t("patient.hello", { name: user?.fullName?.split(" ")[0] ?? "" })}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("patient.subtitle")}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 overflow-x-auto">
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={cn("flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                tab === tb.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}>
              <span>{tb.icon}</span><span className="hidden sm:inline">{tb.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

            {/* ── Dashboard ── */}
            {tab === "dashboard" && (
              <div className="space-y-6">
                {loading ? <Spinner /> : (
                  <>
                    {/* Next appointment */}
                    {nextAppt && (
                      <motion.div whileHover={{ scale: 1.01 }}
                        className="glass-dark rounded-2xl p-6 border border-primary/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
                        <div className="relative">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-xs text-white/60 uppercase tracking-wider mb-2">{t("patient.nextAppt")}</div>
                              <h3 className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
                                {nextAppt.service.name}
                              </h3>
                              <p className="text-white/70 mt-1">{nextAppt.doctorUser.fullName}</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">{t("patient.confirmed")}</Badge>
                          </div>
                          <div className="flex gap-6 mt-4">
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                              <span>📅</span>
                              <span>{new Date(nextAppt.appointment.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                              <span>🕐</span>
                              <span>{nextAppt.appointment.time.slice(0, 5)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: t("patient.stats.totalVisits"), value: appointments.filter(a => a.appointment.status === "completed").length, icon: "📅", color: "text-primary" },
                        { label: t("patient.stats.treatments"), value: appointments.filter(a => a.appointment.status === "completed").length, icon: "🦷", color: "text-[#C9A84C]" },
                        { label: t("patient.stats.xrays"), value: xrays.length, icon: "📋", color: "text-purple-500" },
                        { label: t("patient.stats.points"), value: profile?.patient.loyaltyPoints ?? 0, icon: "⭐", color: "text-orange-500" },
                      ].map(stat => (
                        <motion.div key={stat.label} whileHover={{ y: -3 }}
                          className="glass rounded-xl p-4 border border-border">
                          <div className="text-2xl mb-1">{stat.icon}</div>
                          <div className={cn("text-2xl font-bold font-[family-name:var(--font-display)]", stat.color)}>{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Quick actions */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate("/book")}
                        className="glass rounded-xl p-6 border border-primary/20 text-left hover:border-primary/40 transition-all">
                        <div className="text-3xl mb-3">📅</div>
                        <div className="font-semibold text-foreground">{t("patient.quickActions.book")}</div>
                        <div className="text-sm text-muted-foreground mt-1">{t("patient.quickActions.bookSub")}</div>
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} onClick={() => setTab("dental-chart")}
                        className="glass rounded-xl p-6 border border-[#C9A84C]/20 text-left hover:border-[#C9A84C]/40 transition-all">
                        <div className="text-3xl mb-3">🦷</div>
                        <div className="font-semibold text-foreground">{t("patient.quickActions.chart")}</div>
                        <div className="text-sm text-muted-foreground mt-1">{t("patient.quickActions.chartSub")}</div>
                      </motion.button>
                    </div>

                    {/* Recent appointments */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4 font-[family-name:var(--font-display)]">
                        {t("patient.recent")}
                      </h3>
                      <div className="space-y-3">
                        {appointments.slice(0, 5).map(a => (
                          <motion.div key={a.appointment.id} whileHover={{ x: 3 }}
                            className="glass rounded-xl p-4 border border-border flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                              {a.service.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground truncate">{a.service.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {a.doctorUser.fullName} · {a.appointment.date} at {a.appointment.time.slice(0, 5)}
                              </div>
                            </div>
                            <Badge className={cn("text-xs", STATUS_COLORS[a.appointment.status] ?? "bg-muted")}>
                              {a.appointment.status}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Appointments ── */}
            {tab === "appointments" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">
                    {t("patient.allAppts")}
                  </h2>
                  <Button size="sm" onClick={() => navigate("/book")} className="bg-primary text-white">+ {t("common.book")}</Button>
                </div>
                {loading ? <Spinner /> : appointments.map(a => (
                  <motion.div key={a.appointment.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-2xl p-5 border border-border hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                        {a.service.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-foreground">{a.service.name}</div>
                            <div className="text-sm text-muted-foreground mt-0.5">{a.doctorUser.fullName}</div>
                          </div>
                          <Badge className={cn("text-xs flex-shrink-0", STATUS_COLORS[a.appointment.status] ?? "bg-muted")}>
                            {a.appointment.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                          <span>📅 {new Date(a.appointment.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                          <span>🕐 {a.appointment.time.slice(0, 5)}</span>
                          <span>⏱ {a.appointment.duration} {t("common.min")}</span>
                          {a.appointment.room && <span>🏠 {t("common.room")} {a.appointment.room}</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {!loading && appointments.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No appointments yet.{" "}
                    <button onClick={() => navigate("/book")} className="text-primary underline">Book one now</button>
                  </div>
                )}
              </div>
            )}

            {/* ── Dental chart ── */}
            {tab === "dental-chart" && patientId && (
              <div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground mb-2">
                  {t("patient.chartTitle")}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">{t("patient.chartSubtitle")}</p>
                <ToothChart patientId={patientId} />
              </div>
            )}

            {/* ── X-Rays ── */}
            {tab === "records" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">
                  {t("patient.records")}
                </h2>
                {xrays.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No X-rays uploaded yet.</div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {xrays.map(x => (
                      <motion.div key={x.xray.id} whileHover={{ y: -4 }}
                        className="glass rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all">
                        <div className="relative">
                          <img src={x.xray.fileUrl} alt={x.xray.type}
                            className="w-full h-40 object-cover"
                            onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80"; }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                            <Badge className="bg-black/50 text-white border-white/20 text-xs capitalize">{x.xray.type}</Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="text-sm font-medium text-foreground capitalize">{x.xray.type}</div>
                          <div className="text-xs text-muted-foreground mt-1">📅 {x.xray.takenAt}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">👨‍⚕️ {x.doctor.fullName}</div>
                          {x.xray.notes && <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{x.xray.notes}</div>}
                          <Button size="sm" variant="outline" className="w-full mt-4 text-xs border-primary/30 text-primary hover:bg-primary/5"
                            onClick={() => window.open(x.xray.fileUrl, "_blank")}>
                            {t("patient.viewFull")}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 inset-x-0 md:hidden glass border-t border-border px-4 py-2 z-40">
        <div className="flex justify-around">
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={cn("flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all",
                tab === tb.id ? "text-primary" : "text-muted-foreground"
              )}>
              <span className="text-xl">{tb.icon}</span>
              <span className="text-[10px] font-medium">{tb.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
