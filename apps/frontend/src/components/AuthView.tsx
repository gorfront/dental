"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

import { AuthSidebar } from "./auth/AuthSidebar";
import { LoginForm } from "./auth/LoginForm";
import { RegisterForm } from "./auth/RegisterForm";

export default function AuthView({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const lang = useLanguageStore((state) => state.lang);
  const t = dictionaries[mounted ? lang : 'en'];

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f9fafb] font-sans">
      <AuthSidebar />

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 relative">
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="w-full max-w-md mx-auto"
        >
            <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 border-2 border-[#107070] text-[#107070] rounded-xl flex items-center justify-center relative shadow-sm">
                    <div className="absolute -top-1 w-full flex justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M12 2C8.5 2 6 4.5 6 9.5c0 3.5 1.5 5.5 2.5 8.5.5 1.5 1.5 3 2.5 3 .5 0 1-1 1-2v-3c0-.5.5-1 1-1h0c.5 0 1 .5 1 1v3c0 1 .5 2 1 2 1 0 2-1.5 2.5-3 1-3 2.5-5 2.5-8.5C20 4.5 17.5 2 14 2h-2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="font-serif font-bold text-xl text-gray-900 leading-tight">Andreasyan Dental</h2>
                    <p className="text-xs text-[#107070] font-medium">{t.auth.portal}</p>
                </div>
            </div>

            <div className="flex bg-gray-100/80 p-1.5 rounded-xl mb-8">
                <button type="button" onClick={() => switchMode('login')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                    {t.auth.tabSignIn}
                </button>
                <button type="button" onClick={() => switchMode('register')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                    {t.auth.tabCreate}
                </button>
            </div>

            {error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}

            {mode === 'login' ? (
                <LoginForm setError={setError} setMode={switchMode} />
            ) : (
                <RegisterForm setError={setError} setMode={switchMode} />
            )}

            <div className="text-center mt-8">
               <Link href="/" className="inline-flex items-center text-sm font-medium text-[#107070] hover:underline">
                  {t.auth.backHome}
               </Link>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
