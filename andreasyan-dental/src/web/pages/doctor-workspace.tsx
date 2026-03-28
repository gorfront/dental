import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { LangSwitcher } from "../components/lang-switcher";
import { api, AppointmentItem, PatientItem, ToothItem, XRayItem } from "../lib/api";
import { useAuthStore } from "../lib/auth-store";

type Tab = "schedule" | "patients" | "chart" | "xrays";
type ToothStatus = "healthy" | "cavity" | "filling" | "crown" | "missing";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  waiting:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  inchair:   "bg-teal-100 text-teal-700 border-teal-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};
const STATUS_OPTIONS = ["waiting", "inchair", "completed", "cancelled"];

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
  healthy: "#e8f5f5", cavity: "#fde8e8", filling: "#e8f0fe", crown: "#fef9e8",
  missing: "#f3f4f6", implant: "#f0e8fe", bridge: "#e8fee8", root_canal: "#fee8f0",
};
const STATUS_STROKE: Record<string, string> = {
  healthy: "#0B6E72", cavity: "#dc2626", filling: "#2563eb", crown: "#C9A84C",
  missing: "#9ca3af", implant: "#7c3aed", bridge: "#16a34a", root_canal: "#db2777",
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full" />
    </div>
  );
}

// ─── Tooth chart for doctor (read + write) ────────────────────────────────
function DoctorToothChart({ patientId, patientName }: { patientId: string; patientName: string }) {
  const { t } = useTranslation();
  const [teeth, setTeeth] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<ToothStatus>("healthy");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<ToothItem[]>(`/api/patients/${patientId}/tooth-chart`)
      .then(data => {
        const map: Record<number, string> = {};
        data.forEach(t => { map[t.toothNumber] = t.status; });
        setTeeth(map);
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  const legendItems = [
    { status: "healthy" as ToothStatus, label: t("patient.toothStatus.healthy") },
    { status: "cavity" as ToothStatus, label: t("patient.toothStatus.cavity") },
    { status: "filling" as ToothStatus, label: t("patient.toothStatus.filling") },
    { status: "crown" as ToothStatus, label: t("patient.toothStatus.crown") },
    { status: "missing" as ToothStatus, label: t("patient.toothStatus.missing") },
  ];

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/api/patients/${patientId}/tooth-chart/${selected}`, { status: editStatus, notes: notes || undefined });
      setTeeth(prev => ({ ...prev, [selected]: editStatus }));
      setNotes("");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground font-[family-name:var(--font-display)]">
          {t("doctor.tabs.chart")} — {patientName}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {legendItems.map(l => (
          <div key={l.status} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded border"
              style={{ background: STATUS_FILL[l.status], borderColor: STATUS_STROKE[l.status] }} />
            <span className="text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
      <div className="glass rounded-xl p-3 border border-border overflow-x-auto">
        <svg viewBox="0 60 680 110" className="w-full min-w-[500px]" style={{ height: 150 }}>
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
            <div className="flex gap-2 mt-2">
              <input value={notes} onChange={e => setNotes(e.target.value)}
                placeholder={t("common.addNote")}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" />
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-primary text-white text-xs">
                {saving ? "…" : t("common.apply")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── X-Ray upload panel ───────────────────────────────────────────────────
function XRayPanel({ patientId }: { patientId: string }) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [xrays, setXrays] = useState<XRayItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<XRayItem[]>(`/api/patients/${patientId}/xrays`).then(setXrays);
  }, [patientId]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("patientId", patientId);
      form.append("type", "panoramic");
      form.append("takenAt", new Date().toISOString().split("T")[0]);
      const newXray = await api.upload<XRayItem>("/api/xrays/upload", form);
      setXrays(prev => [newXray, ...prev]);
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground font-[family-name:var(--font-display)]">{t("doctor.xray.title")}</h3>
      <motion.div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}
        onClick={() => inputRef.current?.click()}
        animate={dragging ? { scale: 1.02 } : { scale: 1 }}
        className={cn("drop-zone rounded-2xl p-10 text-center cursor-pointer transition-all", dragging && "active")}>
        <input ref={inputRef} type="file" className="hidden" accept="image/*"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-5xl mb-3">⏳</div>
              <p className="font-medium text-foreground">Uploading…</p>
            </motion.div>
          ) : dragging ? (
            <motion.div key="dragging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-5xl mb-3">📂</div>
              <p className="text-primary font-semibold">{t("doctor.xray.release")}</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-5xl mb-3">🩻</div>
              <p className="font-medium text-foreground">{t("doctor.xray.dropTitle")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("doctor.xray.dropSub")}</p>
              <p className="text-xs text-muted-foreground mt-2">{t("doctor.xray.dropTypes")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="grid sm:grid-cols-2 gap-4">
        {xrays.map(x => (
          <motion.div key={x.xray.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl overflow-hidden border border-border">
            <img src={x.xray.fileUrl} alt={x.xray.type} className="w-full h-32 object-cover"
              onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80"; }} />
            <div className="p-3">
              <div className="font-medium text-xs text-foreground capitalize">{x.xray.type}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">📅 {x.xray.takenAt}</div>
              {x.xray.notes && <div className="text-[10px] text-muted-foreground mt-1">{x.xray.notes}</div>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main workspace ───────────────────────────────────────────────────────
export default function DoctorWorkspace() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("schedule");
  const [, navigate] = useLocation();
  const { user, doctorId, meLoaded, fetchMe } = useAuthStore();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [apptStatuses, setApptStatuses] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split("T")[0];

  // Step 1: if token is in storage but store isn't hydrated yet, fetch once
  useEffect(() => {
    if (!meLoaded) { fetchMe(); }
  }, []); // runs once on mount only

  // Step 2: once we have user + doctorId, load schedule
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!meLoaded) return; // wait for fetchMe to finish
    if (!doctorId) {
      // Doctor role but no profile row — show a helpful message, don't loop
      setLoadingAppts(false);
      return;
    }
    api.get<AppointmentItem[]>(`/api/doctors/${doctorId}/appointments?date=${today}`)
      .then(setAppointments)
      .finally(() => setLoadingAppts(false));
  }, [user, doctorId, meLoaded]);

  useEffect(() => {
    if (tab === "patients" && patients.length === 0) {
      setLoadingPatients(true);
      api.get<PatientItem[]>("/api/patients")
        .then(data => { setPatients(data); if (data.length > 0) setSelectedPatient(data[0]); })
        .finally(() => setLoadingPatients(false));
    }
  }, [tab]);

  const handleStatusChange = async (apptId: string, status: string) => {
    try {
      await api.patch(`/api/appointments/${apptId}/status`, { status });
      setApptStatuses(prev => ({ ...prev, [apptId]: status }));
    } catch {
      // revert on error — don't crash
    }
  };

  const tabs = [
    { id: "schedule" as Tab, label: t("doctor.tabs.schedule"), icon: "📅" },
    { id: "patients" as Tab, label: t("doctor.tabs.patients"), icon: "👥" },
    { id: "chart" as Tab, label: t("doctor.tabs.chart"), icon: "🦷" },
    { id: "xrays" as Tab, label: t("doctor.tabs.xrays"), icon: "🩻" },
  ];

  const avatarUrl = user?.avatarUrl
    ?? `https://api.dicebear.com/9.x/personas/svg?seed=${user?.email}&backgroundColor=0B6E72`;

  // Doctor account exists but no doctors table row yet — admin hasn't set up their profile
  if (meLoaded && user && !doctorId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center glass rounded-3xl p-10 border border-primary/20">
          <div className="text-6xl mb-6">🦷</div>
          <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-foreground mb-3">
            Profile Not Set Up Yet
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your doctor account (<strong>{user.email}</strong>) has been created, but your clinic profile hasn't been configured by the administrator yet.
          </p>
          <p className="text-muted-foreground text-sm mt-3">
            Please contact the admin to complete your setup.
          </p>
          <button onClick={() => { useAuthStore.getState().logout(); navigate("/"); }}
            className="mt-6 text-sm text-primary hover:underline">
            ← Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header initial={{ y: -60 }} animate={{ y: 0 }}
        className="sticky top-0 z-40 glass border-b border-border px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")}
            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">🦷</button>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{t("doctor.workspace")}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-foreground">{user?.fullName}</div>
          </div>
          <img src={avatarUrl} alt={user?.fullName} className="w-9 h-9 rounded-full border-2 border-primary/30" />
        </div>
      </motion.header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: t("doctor.stats.todayAppts"), value: appointments.length, icon: "📅", color: "text-primary" },
            { label: t("doctor.stats.seen"), value: appointments.filter(a => (apptStatuses[a.appointment.id] || a.appointment.status) === "completed").length, icon: "✅", color: "text-green-600" },
            { label: t("doctor.stats.waiting"), value: appointments.filter(a => (apptStatuses[a.appointment.id] || a.appointment.status) === "waiting").length, icon: "⏳", color: "text-yellow-600" },
            { label: t("doctor.stats.nextBreak"), value: "13:00", icon: "☕", color: "text-[#C9A84C]" },
          ].map(s => (
            <motion.div key={s.label} whileHover={{ y: -2 }} className="glass rounded-xl p-4 border border-border">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={cn("text-2xl font-bold font-[family-name:var(--font-display)]", s.color)}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

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

            {/* ── Schedule ── */}
            {tab === "schedule" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground">
                  {t("doctor.today")} — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h2>
                {loadingAppts ? <Spinner /> : (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-4">
                      {appointments.sort((a, b) => a.appointment.time.localeCompare(b.appointment.time)).map((apt, i) => {
                        const status = apptStatuses[apt.appointment.id] || apt.appointment.status;
                        return (
                          <motion.div key={apt.appointment.id}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }} className="relative pl-16">
                            <div className="absolute left-4 top-5 w-4 h-4 rounded-full border-2 border-primary bg-background" />
                            <div className="absolute left-0 top-4 text-xs font-mono text-muted-foreground w-12 text-right pr-2">
                              {apt.appointment.time.slice(0, 5)}
                            </div>
                            <motion.div whileHover={{ x: 4 }}
                              className={cn("glass rounded-2xl p-5 border-2 transition-all", STATUS_COLORS[status])}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-3">
                                  <img src={apt.patientUser.avatarUrl ?? `https://api.dicebear.com/9.x/personas/svg?seed=${apt.patientUser.fullName}`}
                                    alt={apt.patientUser.fullName}
                                    className="w-10 h-10 rounded-xl object-cover" />
                                  <div>
                                    <div className="font-semibold text-sm text-foreground">{apt.patientUser.fullName}</div>
                                    <div className="text-xs text-muted-foreground">{apt.service.name} · {apt.appointment.duration} {t("common.min")}</div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                  <Badge className={cn("text-xs", STATUS_COLORS[status])}>{status}</Badge>
                                  <select value={status}
                                    onChange={e => handleStatusChange(apt.appointment.id, e.target.value)}
                                    className="text-xs px-2 py-1 rounded-lg border border-border bg-background text-foreground focus:outline-none cursor-pointer">
                                    {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div className="flex gap-3 mt-3">
                                <Button size="sm" variant="outline" className="text-xs"
                                  onClick={() => {
                                    const p = patients.find(p => p.patient.id === apt.patient.id);
                                    if (p) { setSelectedPatient(p); setTab("chart"); }
                                    else {
                                      // load patient if not yet in list
                                      api.get<PatientItem>(`/api/patients/${apt.patient.id}`)
                                        .then(p => { setSelectedPatient(p); setTab("chart"); });
                                    }
                                  }}>
                                  {t("doctor.viewChart")}
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs"
                                  onClick={() => {
                                    const p = patients.find(p => p.patient.id === apt.patient.id);
                                    if (p) { setSelectedPatient(p); setTab("xrays"); }
                                    else {
                                      api.get<PatientItem>(`/api/patients/${apt.patient.id}`)
                                        .then(p => { setSelectedPatient(p); setTab("xrays"); });
                                    }
                                  }}>
                                  {t("doctor.tabs.xrays")}
                                </Button>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                      {appointments.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">No appointments today.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Patients ── */}
            {tab === "patients" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-foreground mb-4">
                  {t("doctor.myPatients")}
                </h2>
                {loadingPatients ? <Spinner /> : patients.map((p, i) => (
                  <motion.div key={p.patient.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    whileHover={{ x: 4 }}
                    className="glass rounded-2xl p-5 border border-border hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => { setSelectedPatient(p); setTab("chart"); }}>
                    <div className="flex gap-4 items-center">
                      <img src={p.user.avatarUrl ?? `https://api.dicebear.com/9.x/personas/svg?seed=${p.user.email}`}
                        alt={p.user.fullName} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{p.user.fullName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{p.user.phone} · {p.user.email}</div>
                        {p.patient.medicalNotes && <div className="text-xs text-orange-500 mt-1">⚠ {p.patient.medicalNotes}</div>}
                        {p.patient.allergies && <div className="text-xs text-red-500 mt-0.5">⚗ {p.patient.allergies}</div>}
                      </div>
                      {Number(p.patient.balance) !== 0 && (
                        <Badge className={Number(p.patient.balance) > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                          {Number(p.patient.balance) > 0 ? `Owes $${p.patient.balance}` : "Paid"}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── Chart ── */}
            {tab === "chart" && selectedPatient && (
              <DoctorToothChart
                patientId={selectedPatient.patient.id}
                patientName={selectedPatient.user.fullName}
              />
            )}
            {tab === "chart" && !selectedPatient && (
              <div className="text-center py-12 text-muted-foreground">
                Select a patient from the Patients tab first.
              </div>
            )}

            {/* ── X-Rays ── */}
            {tab === "xrays" && selectedPatient && (
              <XRayPanel patientId={selectedPatient.patient.id} />
            )}
            {tab === "xrays" && !selectedPatient && (
              <div className="text-center py-12 text-muted-foreground">
                Select a patient first.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
