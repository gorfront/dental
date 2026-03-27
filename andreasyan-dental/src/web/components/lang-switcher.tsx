import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LANGUAGES, setLanguage } from "../lib/i18n";
import { cn } from "../lib/utils";

interface LangSwitcherProps {
  variant?: "light" | "dark";
  className?: string;
}

export function LangSwitcher({ variant = "light", className }: LangSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (code: string) => {
    setLanguage(code);
    setOpen(false);
  };

  const isDark = variant === "dark";

  return (
    <div ref={ref} className={cn("relative z-50", className)}>
      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all",
          isDark
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        <span className="text-base">{current.flag}</span>
        <span className="font-semibold tracking-wide">{current.label}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={isDark ? "text-white/70" : "text-muted-foreground"}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 rounded-2xl border border-border bg-background shadow-xl shadow-black/10 overflow-hidden"
          >
            {LANGUAGES.map(lang => (
              <motion.button
                key={lang.code}
                whileHover={{ backgroundColor: "oklch(0.48 0.09 195 / 0.08)" }}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left",
                  i18n.language === lang.code
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <div>
                  <div className="font-medium leading-tight">{lang.full}</div>
                  <div className="text-[10px] text-muted-foreground">{lang.label}</div>
                </div>
                {i18n.language === lang.code && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-primary text-xs">✓</motion.span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
