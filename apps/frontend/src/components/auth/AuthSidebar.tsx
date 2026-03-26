"use client";
import { motion } from "framer-motion";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

export function AuthSidebar() {
  const lang = useLanguageStore((state) => state.lang);
  const t = dictionaries[lang || 'en'];

  return (
    <div className="hidden md:flex w-1/2 bg-gradient-to-b from-[#188B8B] to-[#107070] text-white flex-col items-center justify-center p-12 relative overflow-hidden">
      <div className="absolute top-[15%] left-[10%] w-4 h-4 bg-white/20 backdrop-blur-sm rounded-full blur-[2px]"></div>
      <div className="absolute top-[30%] right-[20%] w-6 h-6 bg-white/10 backdrop-blur-sm rounded-full blur-[3px]"></div>
      <div className="absolute bottom-[40%] left-[20%] w-5 h-5 bg-white/15 backdrop-blur-sm rounded-full blur-[2px]"></div>
      <div className="absolute bottom-[35%] right-[15%] w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full blur-[4px]"></div>

      <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center max-w-md w-full relative z-10"
      >
          <div className="w-32 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="white" className="opacity-90">
                  <path d="M12 2C8.5 2 6 4.5 6 9.5c0 3.5 1.5 5.5 2.5 8.5.5 1.5 1.5 3 2.5 3 .5 0 1-1 1-2v-3c0-.5.5-1 1-1h0c.5 0 1 .5 1 1v3c0 1 .5 2 1 2 1 0 2-1.5 2.5-3 1-3 2.5-5 2.5-8.5C20 4.5 17.5 2 14 2h-2z" />
              </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-center leading-[1.1] mb-6 whitespace-pre-line">
              {t.auth.smile}{'\n'}{t.auth.priority}
          </h1>
          
          <p className="text-white/80 font-light text-[15px] mb-16 text-center tracking-wide">
              {t.auth.motto}
          </p>

          <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-28 h-28 flex flex-col justify-center items-center font-serif shadow-lg">
                  <span className="text-2xl font-bold mb-1">10K<span className="text-lg">+</span></span>
                  <span className="text-xs font-sans text-white/70">{t.auth.patients}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-28 h-28 flex flex-col justify-center items-center font-serif shadow-lg">
                  <span className="text-2xl font-bold mb-1 flex items-center gap-1">4.9<span className="text-lg">★</span></span>
                  <span className="text-xs font-sans text-white/70">{t.auth.rating}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-28 h-28 flex flex-col justify-center items-center font-serif shadow-lg">
                  <span className="text-2xl font-bold mb-1">10<span className="text-lg">yr</span></span>
                  <span className="text-xs font-sans text-white/70">{t.auth.experience}</span>
              </div>
          </div>
      </motion.div>
    </div>
  );
}
