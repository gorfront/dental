"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";
import { staggerContainer, fadeInUp } from "../ui/animations";

export function Doctors({ doctors }: { doctors: any[] }) {
  const [mounted, setMounted] = useState(false);
  const lang = useLanguageStore((state) => state.lang);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = dictionaries[mounted ? lang : 'en'];

  return (
    <section id="doctors" className="py-32 px-6 bg-white border-t border-gray-100 relative">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="max-w-6xl mx-auto text-center"
      >
        <motion.span variants={fadeInUp} className="text-brandTeal text-xs font-bold uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full">{t.doctors.tag}</motion.span>
        <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-serif text-[#1F2937] mt-6 mb-20">{t.doctors.titleLine1} <br /><span className="text-brandGold italic">{t.doctors.titleLine2}</span></motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {doctors.map((doc, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className="rounded-[2.5rem] overflow-hidden bg-white flex flex-col border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-shadow"
            >
              <div className={`h-48 ${doc.bg} flex items-end justify-center pt-8 px-4 relative overflow-hidden`}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
                ></motion.div>
                <div className="w-32 h-32 bg-black/10 rounded-t-full relative z-10 shadow-inner overflow-hidden">
                  <div className="absolute inset-x-2 bottom-0 top-3 bg-black/20 rounded-t-full mix-blend-overlay"></div>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1 relative bg-white">
                <div className="absolute -top-5 right-6 bg-white px-3 py-1 rounded-full shadow-lg border border-gray-100 flex items-center gap-1 text-sm font-bold text-gray-700">
                  <span className="text-brandGold">★</span> {doc.rating}
                </div>
                <p className="text-xs text-brandTeal font-bold uppercase tracking-wide bg-teal-50 inline-block px-3 py-1 rounded-full w-fit mb-4">{doc.spec}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{doc.name}</h3>
                <p className="text-gray-500 font-light mb-8 flex-1 leading-relaxed">{doc.fullDesc}</p>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-400">{doc.exp} experience</div>
                  <Link href={`/book`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-brandTeal text-sm font-bold bg-teal-50 px-5 py-2.5 rounded-full hover:bg-brandTeal hover:text-white transition-colors"
                    >
                      Book
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
