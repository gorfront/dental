"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Phone } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

export function FooterCTA() {
  const [mounted, setMounted] = useState(false);
  const lang = useLanguageStore((state) => state.lang);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = dictionaries[mounted ? lang : 'en'];

  return (
    <section id="contact" className="py-32 px-6 bg-white text-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-2xl h-64 bg-brandTeal/5 rounded-full blur-[100px] -z-10"></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="w-20 h-20 bg-teal-50 text-brandTeal rounded-[1.5rem] flex items-center justify-center mx-auto mb-10 transform -rotate-3 shadow-sm border border-brandTeal/10"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <h2 className="text-5xl md:text-7xl font-serif text-gray-900 mb-6 tracking-tight">{t.cta.titleLine1} <br /><span className="text-brandGold italic">{t.cta.titleLine2}</span></h2>
        <p className="text-gray-500 mb-12 text-xl font-light max-w-xl mx-auto">{t.cta.desc}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/book" className="w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(20, 107, 107, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-brandTeal text-white px-10 py-5 rounded-full font-bold text-lg transition-colors shadow-lg"
            >
              {t.cta.book}
            </motion.div>
          </Link>
          <a href="tel:+374123456" className="w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white border border-gray-200 text-gray-700 px-10 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-sm"
            >
              <Phone className="w-5 h-5" /> {t.cta.call}
            </motion.div>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
