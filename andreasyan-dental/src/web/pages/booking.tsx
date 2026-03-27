import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { LangSwitcher } from "../components/lang-switcher";
import { api, ServiceItem, DoctorItem, SlotItem } from "../lib/api";
import { useAuthStore } from "../lib/auth-store";

// Keep only pure UI constants — no mock data
const TIME_SLOTS_FALLBACK = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30",
];

type Step = 1 | 2 | 3 | 4;

// Generate 14 dates starting from today
const DATES = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return d;
});

function Spinner() {
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full mx-auto" />
  );
}

export default function BookingPage() {
  const { t } = useTranslation();
  const STEP_LABELS = t("booking.steps", { returnObjects: true }) as string[];
  const [, navigate] = useLocation();
  const { user, patientId } = useAuthStore();

  // ── Data from API ────────────────────────────────────────────────────────
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ── Wizard state ─────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");


  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [apptRef, setApptRef] = useState("");
  const [error, setError] = useState("");
  const [direction, setDirection] = useState(1);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedDoctor = doctors.find(d => d.doctor.id === selectedDoctorId);

  // ── Load services on mount ────────────────────────────────────────────────
  useEffect(() => {
    api.get<ServiceItem[]>("/api/services")
      .then(data => setServices(data))
      .catch(() => setError("Failed to load services"))
      .finally(() => setLoadingServices(false));
  }, []);

  // ── Load doctors when moving to step 2 ───────────────────────────────────
  useEffect(() => {
    if (step === 2 && doctors.length === 0) {
      setLoadingDoctors(true);
      api.get<DoctorItem[]>("/api/doctors")
        .then(data => setDoctors(data))
        .catch(() => setError("Failed to load doctors"))
        .finally(() => setLoadingDoctors(false));
    }
  }, [step]);

  // ── Load slots when date + doctor selected ────────────────────────────────
  useEffect(() => {
    if (step === 3 && selectedDoctorId && selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      setLoadingSlots(true);
      setSlots([]);
      api.get<{ slots: SlotItem[] }>(`/api/doctors/${selectedDoctorId}/slots?date=${dateStr}`)
        .then(res => setSlots(res.slots))
        .catch(() => setSlots(TIME_SLOTS_FALLBACK.map(t => ({ time: t, available: true }))))
        .finally(() => setLoadingSlots(false));
    }
  }, [step, selectedDoctorId, selectedDate]);

  const goNext = () => { setDirection(1); setStep(s => (s + 1) as Step); };
  const goPrev = () => { setDirection(-1); setStep(s => (s - 1) as Step); };

  const handleConfirm = async () => {
    if (!selectedServiceId || !selectedDoctorId || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError("");
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const body = {
        patientId: patientId!,
        doctorId: selectedDoctorId,
        serviceId: selectedServiceId,
        date: dateStr,
        time: selectedTime,
        duration: selectedService!.duration,
        price: selectedService!.price,
        notes: notes || undefined,
      };
      const res = await api.post<{ id: string }>("/api/appointments", body);
      setApptRef(`AND-${res.id.slice(0, 8).toUpperCase()}`);
      setConfirmed(true);
    } catch (err: any) {
      setError(err.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  // ── Confirmed screen ──────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center glass rounded-3xl p-10 border border-primary/20 teal-glow">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-6">✅</motion.div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-foreground">
            {t("booking.confirmed.title")}
          </h2>
          <p className="text-muted-foreground mt-3">
            {t("booking.confirmed.message", {
              doctor: selectedDoctor?.user.fullName ?? "",
              service: selectedService?.name ?? "",
              date: selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) ?? "",
              time: selectedTime,
            })}
          </p>
          <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10 text-left">
            <div className="text-xs text-muted-foreground">{t("booking.confirmed.ref")}</div>
            <div className="font-mono font-bold text-primary text-lg">{apptRef}</div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{t("booking.confirmed.sms")}</p>
          <div className="flex gap-3 mt-8">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
              {t("booking.confirmed.home")}
            </Button>
            <Button className="flex-1 bg-primary text-white" onClick={() => navigate("/patient")}>
              {t("booking.confirmed.portal")}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="animated-gradient py-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white font-[family-name:var(--font-display)]">
            {t("booking.title")}
          </h1>
          <p className="text-white/70 mt-2">{t("booking.subtitle")}</p>
          <div className="flex justify-center mt-4"><LangSwitcher variant="dark" /></div>
        </motion.div>
      </div>

      {/* Stepper */}
      <div className="max-w-2xl mx-auto px-6 -mt-6">
        <div className="glass rounded-2xl p-4 border border-border">
          <div className="flex items-center">
            {STEP_LABELS.map((label, i) => {
              const s = (i + 1) as Step;
              const isActive = step === s;
              const isDone = step > s;
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      isActive && "bg-primary text-white shadow-lg shadow-primary/30",
                      isDone && "bg-green-500 text-white",
                      !isActive && !isDone && "bg-muted text-muted-foreground"
                    )}>
                      {isDone ? "✓" : s}
                    </div>
                    <span className={cn("text-xs mt-1 font-medium hidden sm:block",
                      isActive ? "text-primary" : isDone ? "text-green-600" : "text-muted-foreground"
                    )}>{label}</span>
                  </div>
                  {i < 3 && <div className={cn("flex-1 h-0.5 mx-2 transition-all", isDone ? "bg-green-500" : "bg-border")} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
            {error}
          </div>
        )}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}>

            {/* Step 1: Service */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-foreground mb-6">
                  {t("booking.chooseService")}
                </h2>
                {loadingServices ? (
                  <div className="py-12"><Spinner /></div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {services.map(s => (
                      <motion.button key={s.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedServiceId(s.id)}
                        className={cn(
                          "p-5 rounded-2xl text-left border-2 transition-all",
                          selectedServiceId === s.id
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-border hover:border-primary/40 glass"
                        )}>
                        <div className="text-3xl mb-2">{s.icon}</div>
                        <div className="font-semibold text-sm text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {s.duration} {t("services.min")} · {t("services.from")} ${s.price}
                        </div>
                        {selectedServiceId === s.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="mt-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">✓</motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
                <div className="mt-8 flex justify-end">
                  <Button onClick={goNext} disabled={!selectedServiceId || loadingServices}
                    className="bg-primary text-white px-8">{t("booking.nextService")}</Button>
                </div>
              </div>
            )}

            {/* Step 2: Doctor */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-foreground mb-6">
                  {t("booking.chooseDoctor")}
                </h2>
                {loadingDoctors ? (
                  <div className="py-12"><Spinner /></div>
                ) : (
                  <div className="space-y-4">
                    {doctors.map(d => (
                      <motion.button key={d.doctor.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedDoctorId(d.doctor.id)}
                        className={cn(
                          "w-full p-5 rounded-2xl text-left border-2 flex gap-4 items-center transition-all",
                          selectedDoctorId === d.doctor.id
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-border hover:border-primary/40 glass"
                        )}>
                        <img src={d.user.avatarUrl ?? `https://api.dicebear.com/9.x/personas/svg?seed=${d.user.fullName}`}
                          alt={d.user.fullName} className="w-14 h-14 rounded-xl object-cover" />
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{d.user.fullName}</div>
                          <div className="text-sm text-primary">{d.doctor.specialty}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <span key={j} className="text-[#C9A84C] text-xs">★</span>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {d.doctor.rating} · {d.doctor.experience} {t("doctors.yrsExp")}
                            </span>
                          </div>
                        </div>
                        {selectedDoctorId === d.doctor.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">✓</div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
                <div className="mt-8 flex gap-3 justify-between">
                  <Button variant="outline" onClick={goPrev}>{t("booking.back")}</Button>
                  <Button onClick={goNext} disabled={!selectedDoctorId || loadingDoctors}
                    className="bg-primary text-white px-8">{t("booking.nextDoctor")}</Button>
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-foreground mb-6">
                  {t("booking.selectDateTime")}
                </h2>
                {/* Date strip */}
                <div className="mb-6">
                  <div className="text-sm font-medium text-foreground mb-3">{t("booking.selectDate")}</div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {DATES.map(d => {
                      const isSelected = selectedDate?.toDateString() === d.toDateString();
                      return (
                        <motion.button key={d.toISOString()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => { setSelectedDate(d); setSelectedTime(""); }}
                          className={cn(
                            "flex-shrink-0 w-16 py-3 rounded-xl flex flex-col items-center gap-0.5 border-2 transition-all text-center",
                            isSelected ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40 glass"
                          )}>
                          <span className="text-xs font-medium">
                            {d.toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                          <span className="text-lg font-bold">{d.getDate()}</span>
                          <span className="text-[10px] opacity-70">
                            {d.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="text-sm font-medium text-foreground mb-3">{t("booking.availableTimes")}</div>
                    {loadingSlots ? (
                      <div className="py-6"><Spinner /></div>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {(slots.length > 0 ? slots : TIME_SLOTS_FALLBACK.map(t => ({ time: t, available: true }))).map(slot => {
                          const isBooked = !slot.available;
                          const isSelected = selectedTime === slot.time;
                          return (
                            <motion.button key={slot.time}
                              whileHover={!isBooked ? { scale: 1.08 } : {}}
                              disabled={isBooked}
                              onClick={() => !isBooked && setSelectedTime(slot.time)}
                              className={cn(
                                "py-2 px-1 rounded-xl text-sm font-medium transition-all border",
                                isBooked && "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-transparent",
                                isSelected && !isBooked && "bg-primary text-white border-primary shadow-lg shadow-primary/30",
                                !isSelected && !isBooked && "border-border hover:border-primary/50 glass"
                              )}>
                              {slot.time}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="mt-8 flex gap-3 justify-between">
                  <Button variant="outline" onClick={goPrev}>{t("booking.back")}</Button>
                  <Button onClick={goNext} disabled={!selectedDate || !selectedTime}
                    className="bg-primary text-white px-8">{t("booking.nextDate")}</Button>
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-foreground mb-6">
                  {t("booking.confirmBooking")}
                </h2>
                <div className="glass rounded-2xl p-6 border border-primary/20 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Service", value: selectedService?.name, icon: selectedService?.icon },
                      { label: "Doctor", value: selectedDoctor?.user.fullName, icon: "👨‍⚕️" },
                      { label: "Date", value: selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }), icon: "📅" },
                      { label: "Time", value: selectedTime, icon: "🕐" },
                      { label: "Duration", value: `${selectedService?.duration} min`, icon: "⏱" },
                      { label: "Est. Cost", value: `from $${selectedService?.price}`, icon: "💰" },
                    ].map(item => (
                      <div key={item.label} className="flex gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                          <div className="font-medium text-sm text-foreground">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* If logged in: show their info as read-only. If not: prompt to sign in. */}
                {user ? (
                  <div className="mb-4 p-4 rounded-2xl bg-primary/5 border border-primary/15 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{user.fullName}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">✓ Logged in</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                    <span>Not logged in — your appointment won't be tracked. </span>
                    <button type="button" onClick={() => navigate("/login")}
                      className="underline font-medium">Sign in first</button>
                    <span> or </span>
                    <button type="button" onClick={() => navigate("/register")}
                      className="underline font-medium">create an account</button>.
                  </div>
                )}

                {/* Notes field — always shown, for both logged-in and guest */}
                <div>
                  <label className="text-sm font-medium text-foreground">{t("booking.notes")}</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    placeholder={t("booking.notesPlaceholder")}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" />
                </div>

                <div className="mt-8 flex gap-3 justify-between">
                  <Button variant="outline" onClick={goPrev}>{t("booking.back")}</Button>
                  <Button onClick={handleConfirm} disabled={submitting || !patientId}
                    className="bg-[#C9A84C] hover:bg-[#b8943f] text-white px-10 shadow-lg shadow-[#C9A84C]/30">
                    {submitting ? <Spinner /> : t("booking.confirm")}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
