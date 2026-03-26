"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "../ui/animations";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

export function PriorityBanner() {
  const [mounted, setMounted] = useState(false);
  const lang = useLanguageStore((state) => state.lang);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = dictionaries[mounted ? lang : 'en'];

  return (
    <section className="py-0 px-0">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-brandDark text-white px-8 py-20 lg:py-32 lg:pl-32 xl:pl-48 flex items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brandTeal/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-md relative z-10"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif mb-2">Premium Care, <br /><span className="text-brandGold italic">Every Visit</span></motion.h2>
            <motion.div variants={fadeInUp} className="w-16 h-1 bg-brandTeal my-10 rounded-full"></motion.div>
            <div className="space-y-8">
              {[
                { icon: "🏥", title: "Latest Technology", desc: "From 3D scanners to laser tools, ensuring highest quality execution." },
                { icon: "😌", title: "Pain-Free Experience", desc: "Advanced anesthesia and gentle techniques so you feel nothing." },
                { icon: "🌍", title: "International Standards", desc: "Our protocols meet the strictest EU & US healthcare directives." }
              ].map((item, i) => (
                <motion.div key={i} variants={fadeInUp} className="flex gap-5 group cursor-default">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-xl group-hover:bg-brandTeal/20 transition-colors shadow-lg shadow-black/20">
                    {item.icon}
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-lg text-white group-hover:text-brandGold transition-colors">{item.title}</h4>
                    <p className="text-white/50 text-sm mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="bg-[#f0f4f4] px-8 py-20 lg:py-32 flex items-center justify-center relative overflow-hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="bg-brandDark text-white p-10 md:p-12 rounded-[2.5rem] max-w-md relative z-10 shadow-2xl border border-white/10"
          >
            <div className="absolute -top-6 -right-6 text-9xl text-white/5 font-serif font-black">"</div>
            <div className="mb-8 flex gap-1">
              {[1, 2, 3, 4, 5].map(i => <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + (i * 0.1) }} className="text-brandGold text-xl">★</motion.span>)}
            </div>
            <p className="text-xl font-serif italic text-white/90 leading-relaxed mb-10 relative z-10">
              "I couldn't be happier with my new smile. Dr. Armen and the team were exceptionally professional, careful, and totally changed my confidence. It barely felt like I was at a clinic!"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-brandGold to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brandGold/30">V</div>
              <div>
                <p className="font-bold text-lg">Valeria S.</p>
                <p className="text-sm text-white/50 bg-white/5 px-3 py-1 rounded-full mt-1 border border-white/10 inline-block">Porcelain Veneers</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
