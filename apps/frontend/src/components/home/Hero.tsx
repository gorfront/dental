"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";
import { staggerContainer, fadeInUp } from "../ui/animations";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const lang = useLanguageStore((state) => state.lang);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = dictionaries[mounted ? lang : 'en'];

  return (
    <section className="bg-brandTealDark relative pt-40 pb-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-brandTealDark via-[#0B5555] to-[#126F6F] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Hero Text */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-xl text-white"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
            <span className="text-brandGold animate-pulse">★</span> {t.hero.award}
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-serif leading-[1.1] mb-6">
            {t.hero.titleLine1} <br />
            <span className="text-brandGold italic relative inline-block">
              {t.hero.titleLine2}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="absolute -bottom-2 left-0 w-full h-1 bg-brandGold/30 rounded-full origin-left"
              ></motion.span>
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-white/80 text-lg font-light leading-relaxed mb-10 max-w-md">
            {t.hero.subtitle}
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/book" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(208, 167, 82, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-brandGold text-center text-white px-8 py-3.5 rounded-full font-medium transition-colors"
              >
                {t.hero.bookAction}
              </motion.div>
            </Link>
            <Link href="/patient/dashboard" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/5 text-center text-white border border-white/20 px-8 py-3.5 rounded-full font-medium transition-colors backdrop-blur-sm"
              >
                {t.hero.portalAction}
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* In-Line Booking Widget Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50, y: 0 }}
          animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
          transition={{
            duration: 1, delay: 0.3, ease: "easeOut",
            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.3 }
          }}
          className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 text-white shadow-2xl relative"
        >
          <div className="absolute -inset-4 bg-brandGold/10 blur-3xl -z-10 rounded-full"></div>

          <div className="flex bg-white/10 p-1 rounded-xl mb-6">
            <motion.div whileHover={{ scale: 1.02 }} className="flex-1 bg-brandTeal text-center py-2 rounded-lg text-sm font-medium cursor-pointer shadow-md">Any Doctor</motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="flex-1 text-center py-2 text-sm font-medium text-white/70 hover:text-white cursor-pointer transition-colors">Dr. Nare</motion.div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.15)" }} whileTap={{ scale: 0.97 }} className="bg-white/10 border border-white/20 py-3 rounded-xl text-sm font-medium transition-colors">Today</motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-brandTeal border border-brandTeal py-3 rounded-xl text-sm font-medium shadow-lg shadow-brandTeal/40">Tomorrow</motion.button>
            <motion.button whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.15)" }} whileTap={{ scale: 0.97 }} className="bg-white/10 border border-white/20 py-3 rounded-xl text-sm font-medium transition-colors">11:00</motion.button>
            <motion.button whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.15)" }} whileTap={{ scale: 0.97 }} className="bg-white/10 border border-white/20 py-3 rounded-xl text-sm font-medium transition-colors">14:00</motion.button>
          </div>

          <Link href="/book" className="block w-full">
            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: "#1e8e8e" }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-center bg-brandTeal border border-brandTealLight py-3.5 rounded-xl font-medium shadow-lg shadow-brandTeal/20 transition-colors"
            >
              {t.nav.bookNow}
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
