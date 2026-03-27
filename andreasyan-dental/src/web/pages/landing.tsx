import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { TESTIMONIALS } from "../lib/mock-data"; // only static marketing content stays
import { api, ServiceItem, DoctorItem } from "../lib/api";
import { useAuthStore } from "../lib/auth-store";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { LangSwitcher } from "../components/lang-switcher";

function Particle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div className="absolute rounded-full"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: `radial-gradient(circle, oklch(0.60 0.10 195 / 0.6), transparent)` }}
      animate={{ y: [-10, 10, -10], opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: "easeInOut" }} />
  );
}

function ToothLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <motion.path d="M24 4C18 4 12 8 12 14C12 18 13 22 14 24C15 28 15 34 18 40C19 43 21 44 24 44C27 44 29 43 30 40C33 34 33 28 34 24C35 22 36 18 36 14C36 8 30 4 24 4Z"
        stroke="#0B6E72" strokeWidth="2" fill="white"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
      <motion.path d="M20 14C20 12 21 10 24 10C27 10 28 12 28 14" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }} />
    </svg>
  );
}

function StatCounter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0; const step = end / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(start));
        }, 25);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-display)]">{count}{suffix}</div>
      <div className="text-sm text-white/60 mt-1">{label}</div>
    </div>
  );
}

export default function Landing() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();

  // Live data from API
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  useEffect(() => {
    api.get<ServiceItem[]>("/api/services").then(setServices).catch(() => {});
    api.get<DoctorItem[]>("/api/doctors").then(setDoctors).catch(() => {});
  }, []);

  const ROLE_PORTAL: Record<string, string> = { patient: "/patient", doctor: "/doctor", admin: "/admin" };
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const particles = Array.from({ length: 15 }, (_, i) => ({
    delay: i * 0.3, x: Math.random() * 100, y: Math.random() * 100, size: 4 + Math.random() * 8,
  }));

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }),
  };

  const whyItems = t("whyUs.items", { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* NAVBAR */}
      <motion.nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10"
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ToothLogo size={36} />
            <div>
              <div className="font-[family-name:var(--font-display)] font-bold text-lg text-foreground leading-tight">Andreasyan</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Dental Clinic</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {(["services", "doctors", "about", "contact"] as const).map(key => (
              <a key={key} href={`#${key}`} className="text-muted-foreground hover:text-primary transition-colors">
                {t(`nav.${key}`)}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            {user ? (
              <>
                {/* Logged-in: show portal link + logout */}
                <Button variant="ghost" size="sm"
                  onClick={() => navigate(ROLE_PORTAL[user.role] ?? "/patient")}
                  className="text-sm hidden sm:flex text-primary font-medium">
                  {user.fullName.split(" ")[0]} ↗
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => { logout(); }}
                  className="text-sm border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                  {t("admin.signOut")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm"
                  onClick={() => navigate("/login")}
                  className="text-sm hidden sm:flex">
                  {t("nav.signIn")}
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => navigate("/register")}
                  className="text-sm hidden sm:flex border-primary/30 text-primary hover:bg-primary/5">
                  {t("auth.createAccount")}
                </Button>
              </>
            )}
            <Button size="sm" onClick={() => navigate("/book")}
              className="bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25">
              {t("nav.bookNow")}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 animated-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.60_0.10_195_/_0.3),transparent)]" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(oklch(1 0 0 / 0.1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur">{t("hero.badge")}</Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-5xl md:text-7xl font-bold text-white leading-[1.05] font-[family-name:var(--font-display)]">
              {t("hero.title1")}<br /><span style={{ color: "#C9A84C" }}>{t("hero.title2")}</span>
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="mt-6 text-lg text-white/70 max-w-lg leading-relaxed">{t("hero.subtitle")}</motion.p>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" onClick={() => navigate("/book")}
                className="bg-[#C9A84C] hover:bg-[#b8943f] text-white font-semibold px-8 shadow-xl shadow-[#C9A84C]/30 text-base">
                {t("hero.bookBtn")}
              </Button>
              <Button size="lg" variant="outline"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur px-8 text-base"
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
                {t("hero.servicesBtn")}
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="mt-10 flex flex-wrap gap-6">
              {([t("hero.trust1"), t("hero.trust2"), t("hero.trust3")] as string[]).map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                  <span>{["🏆", "⭐", "🦷"][i]}</span><span>{b}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="hidden lg:block relative">
            <div className="relative">
              <motion.div className="glass rounded-3xl p-8 border border-white/20 teal-glow"
                animate={{ y: [-8, 8, -8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl">🦷</div>
                  <div>
                    <div className="font-semibold text-foreground">{t("hero.nextAvailable")}</div>
                    <div className="text-sm text-muted-foreground">Dr. Andreasyan</div>
                  </div>
                  <Badge className="ml-auto bg-green-100 text-green-700">{t("hero.today")}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {["10:00", "11:30", "14:00", "15:30", "16:00", "17:00"].map((time, i) => (
                    <motion.button key={time} whileHover={{ scale: 1.05 }}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${i === 1 ? "bg-primary text-white" : "bg-secondary text-foreground hover:bg-primary/10"}`}>
                      {time}
                    </motion.button>
                  ))}
                </div>
                <Button className="w-full bg-primary text-white">{t("hero.confirm")}</Button>
              </motion.div>
              <motion.div className="absolute -top-8 -right-8 glass rounded-2xl p-4 shadow-xl border border-white/20"
                animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
                <div className="text-2xl font-bold text-primary font-[family-name:var(--font-display)]">98%</div>
                <div className="text-xs text-muted-foreground">{t("hero.satisfactionRate")}</div>
              </motion.div>
              <motion.div className="absolute -bottom-6 -left-8 glass rounded-2xl p-4 shadow-xl border border-white/20"
                animate={{ y: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity, delay: 2 }}>
                <div className="text-2xl font-bold text-[#C9A84C] font-[family-name:var(--font-display)]">10K+</div>
                <div className="text-xs text-muted-foreground">{t("hero.happySmiles")}</div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </section>

      {/* STATS BAND */}
      <section className="py-16 animated-gradient">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {([
            { end: 10, suffix: "+", key: "stats.years" },
            { end: 10000, suffix: "+", key: "stats.smiles" },
            { end: 3, suffix: "", key: "stats.doctors" },
            { end: 98, suffix: "%", key: "stats.satisfaction" },
          ] as const).map(s => <StatCounter key={s.key} end={s.end} suffix={s.suffix} label={t(s.key)} />)}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{t("services.badge")}</Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] text-foreground">
              {t("services.title1")}<br /><span className="gradient-text">{t("services.title2")}</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t("services.subtitle")}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }}
                className="group glass rounded-2xl p-6 border border-border hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
                onClick={() => navigate("/book")}>
                <div className="text-4xl mb-4">{service.icon}</div>
                <Badge className="mb-3 text-xs" variant="secondary">{service.category}</Badge>
                <h3 className="font-semibold text-lg text-foreground font-[family-name:var(--font-display)]">{service.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{service.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <span className="text-xl font-bold text-primary">${service.price}</span>
                    <span className="text-xs text-muted-foreground ml-1">{t("services.from")}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{service.duration} {t("services.min")}</span>
                </div>
                <div className="mt-3 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-[#C9A84C] transition-all duration-500 rounded-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section id="doctors" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{t("doctors.badge")}</Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] text-foreground">
              {t("doctors.title1")}<br /><span className="gradient-text">{t("doctors.title2")}</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {doctors.map((d, i) => (
              <motion.div key={d.doctor.id} initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="group glass rounded-3xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all">
                <div className="h-48 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${d.doctor.color}20, ${d.doctor.color}40)` }}>
                  <img src={d.user.avatarUrl ?? `https://api.dicebear.com/9.x/personas/svg?seed=${d.user.email}`}
                    alt={d.user.fullName} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <span key={j} className="text-[#C9A84C] text-sm">★</span>)}</div>
                    <span className="text-white text-xs">{d.doctor.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg font-[family-name:var(--font-display)] text-foreground">{d.user.fullName}</h3>
                  <p className="text-sm text-primary font-medium mt-1">{d.doctor.specialty}</p>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{d.doctor.bio}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">{d.doctor.experience} {t("doctors.yrsExp")}</span>
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-white"
                      onClick={() => navigate("/book")}>{t("doctors.book")}</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.13 0.03 250), oklch(0.98 0.005 195))" }} />
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Badge className="mb-4 bg-white/10 text-white border-white/20">{t("whyUs.badge")}</Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] text-white leading-tight">
              {t("whyUs.title1")}<br /><span style={{ color: "#C9A84C" }}>{t("whyUs.title2")}</span>
            </h2>
            <div className="mt-8 space-y-6">
              {whyItems.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {["🔬", "😌", "🌍", "💎"][i]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-white/60 mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="glass-dark rounded-3xl p-8 border border-white/10">
              <div className="text-4xl mb-4">"</div>
              <AnimatePresence mode="wait">
                <motion.div key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}>
                  <p className="text-white/90 text-lg leading-relaxed font-[family-name:var(--font-display)] italic">
                    {TESTIMONIALS[activeTestimonial].text}
                  </p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-white font-bold">
                      {TESTIMONIALS[activeTestimonial].name[0]}
                    </div>
                    <div>
                      <div className="text-white font-medium">{TESTIMONIALS[activeTestimonial].name}</div>
                      <div className="text-xs text-white/50">{TESTIMONIALS[activeTestimonial].service}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <span key={j} className="text-[#C9A84C]">★</span>)}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex gap-2 mt-6">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setActiveTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? "bg-[#C9A84C] w-6" : "bg-white/30"}`} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="float w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-5xl mx-auto mb-8">🦷</div>
            <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] text-foreground">
              {t("cta.title1")}<br /><span className="gradient-text">{t("cta.title2")}</span>
            </h2>
            <p className="mt-4 text-muted-foreground">{t("cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" onClick={() => navigate("/book")} className="bg-primary text-white px-10 shadow-xl shadow-primary/25 text-base">
                {t("cta.bookBtn")}
              </Button>
              <Button size="lg" variant="outline" className="px-10 text-base border-primary/30">📞 +374 10 123 456</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{t("cta.address")}</p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ToothLogo size={32} />
            <div>
              <div className="font-bold font-[family-name:var(--font-display)]">Andreasyan Dental</div>
              <div className="text-xs text-muted-foreground">Vagharshapat, Armenia</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{t("footer.rights")}</div>
          <div className="flex items-center gap-4">
            <LangSwitcher />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary">Instagram</a>
              <a href="#" className="hover:text-primary">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
