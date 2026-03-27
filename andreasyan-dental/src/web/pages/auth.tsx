import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { LangSwitcher } from "../components/lang-switcher";
import { useAuthStore } from "../lib/auth-store";

function ToothLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      <path d="M24 4C18 4 12 8 12 14C12 18 13 22 14 24C15 28 15 34 18 40C19 43 21 44 24 44C27 44 29 43 30 40C33 34 33 28 34 24C35 22 36 18 36 14C36 8 30 4 24 4Z"
        stroke="#0B6E72" strokeWidth="2" fill="white" />
      <path d="M20 14C20 12 21 10 24 10C27 10 28 12 28 14"
        stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type AuthMode = "login" | "register";

const ROLE_REDIRECT: Record<string, string> = {
  patient: "/patient",
  doctor:  "/doctor",
  admin:   "/admin",
};

// initialMode lets /login and /register share this component
export default function AuthPage({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const { login, register, loading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name, phone || undefined);
      }
      const user = useAuthStore.getState().user;
      navigate(ROLE_REDIRECT[user?.role ?? "patient"]);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left visual panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center animated-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.60_0.10_195_/_0.3),transparent_70%)]" />
        <div className="relative z-10 text-center px-12">
          <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity }}
            className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center text-7xl mx-auto mb-8 border border-white/20">
            🦷
          </motion.div>
          <h2 className="text-4xl font-bold text-white font-[family-name:var(--font-display)] leading-tight">
            {t("hero.title1")}<br />{t("hero.title2")}
          </h2>
          <p className="text-white/70 mt-4 text-lg">Andreasyan Dental</p>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { n: "10K+", l: t("stats.smiles") },
              { n: "4.9★", l: t("stats.satisfaction") },
              { n: "10yr", l: t("stats.years") },
            ].map(s => (
              <div key={s.l} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">{s.n}</div>
                <div className="text-xs text-white/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div key={i} className="absolute w-3 h-3 rounded-full bg-white/20"
            style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }} />
        ))}
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <ToothLogo />
              <div>
                <div className="font-bold font-[family-name:var(--font-display)] text-foreground">
                  Andreasyan Dental
                </div>
                <div className="text-xs text-muted-foreground">{t("auth.portalSubtitle")}</div>
              </div>
            </div>
            <LangSwitcher />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>

            {/* Mode tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8">
              {(["login", "register"] as AuthMode[]).map(m => (
                <button key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {m === "login" ? t("auth.signIn") : t("auth.createAccount")}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form key={mode}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }} onSubmit={handleSubmit} className="space-y-4">

                {mode === "register" && (
                  <>
                    <div>
                      <Label>{t("auth.fullName")}</Label>
                      <Input value={name} onChange={e => setName(e.target.value)}
                        placeholder="Armen Sargsyan" className="mt-1 h-11" required />
                    </div>
                    <div>
                      <Label>{t("auth.phone") ?? "Phone"}</Label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+374 77 123 456" className="mt-1 h-11" />
                    </div>
                  </>
                )}

                <div>
                  <Label>{t("auth.email")}</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com" className="mt-1 h-11" required />
                </div>

                <div>
                  <Label>{t("auth.password")}</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" className="mt-1 h-11" required minLength={8} />
                </div>

                {error && (
                  <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
                )}

                <Button type="submit"
                  className="w-full h-11 bg-primary text-white shadow-lg shadow-primary/25"
                  disabled={loading}>
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
                </Button>

                {/* Cross-link between modes */}
                <p className="text-center text-sm text-muted-foreground pt-1">
                  {mode === "login" ? (
                    <>
                      {t("auth.noAccount") ?? "Don't have an account?"}{" "}
                      <button type="button" onClick={() => { setMode("register"); setError(""); }}
                        className="text-primary font-medium hover:underline">
                        {t("auth.createAccount")}
                      </button>
                    </>
                  ) : (
                    <>
                      {t("auth.haveAccount") ?? "Already have an account?"}{" "}
                      <button type="button" onClick={() => { setMode("login"); setError(""); }}
                        className="text-primary font-medium hover:underline">
                        {t("auth.signIn")}
                      </button>
                    </>
                  )}
                </p>
              </motion.form>
            </AnimatePresence>
          </motion.div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            <button onClick={() => navigate("/")} className="text-primary hover:underline">
              {t("auth.back")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
