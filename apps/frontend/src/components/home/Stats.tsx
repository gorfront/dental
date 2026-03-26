"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

export function Stats() {
  const [mounted, setMounted] = useState(false);
  const lang = useLanguageStore((state) => state.lang);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = dictionaries[mounted ? lang : 'en'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="bg-brandTeal py-12 px-6 border-t border-white/10 relative z-20 shadow-xl"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-around items-center gap-8 text-white divide-y sm:divide-y-0 sm:divide-x divide-white/20">
        {[
          { to: 10, suffix: "+", label: t.stats.yoe },
          { to: 10000, suffix: "+", label: t.stats.patients },
          { to: 3, suffix: "", label: t.stats.clinics },
          { to: 98, suffix: "%", label: t.stats.success }
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1, textShadow: "0 0 15px rgba(255,255,255,0.5)" }}
            className="text-center w-full px-4 pt-4 sm:pt-0 cursor-default"
          >
            <h3 className="text-4xl font-serif mb-1">
              <AnimatedCounter to={stat.to} suffix={stat.suffix} />
            </h3>
            <p className="text-xs uppercase tracking-widest text-white/70">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
