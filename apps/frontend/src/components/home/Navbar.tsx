"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const lang = useLanguageStore((state) => state.lang);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = dictionaries[mounted ? lang : 'en'];

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="bg-brandTealDark/95 backdrop-blur-md w-full fixed top-0 left-0 right-0 z-50 border-b border-white/10 shadow-lg shadow-black/10"
    >
      <nav className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center text-white/90 relative">
        <Link href="/" className="flex items-center gap-2 group z-50">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-6 h-6 bg-brandGold rounded-sm transform rotate-45"
          ></motion.div>
          <span className="font-bold text-xl tracking-wide ml-1 group-hover:text-white transition-colors">Andreasyan Dental</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center text-sm font-medium ml-8">
          <Link href="/#about" className="relative group overflow-hidden">
            <span className="hover:text-brandGold transition-colors">{t.nav.about}</span>
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-brandGold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          </Link>
          <Link href="/#services" className="relative group overflow-hidden">
            <span className="hover:text-brandGold transition-colors">{t.nav.services}</span>
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-brandGold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          </Link>
          <Link href="/#doctors" className="relative group overflow-hidden">
            <span className="hover:text-brandGold transition-colors">{t.nav.doctors}</span>
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-brandGold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          </Link>
          <Link href="/#contact" className="relative group overflow-hidden">
            <span className="hover:text-brandGold transition-colors">{t.nav.contact}</span>
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-brandGold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          </Link>
        </div>

        {/* Desktop Actions & Language */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <div className="flex gap-2 items-center text-xs font-bold text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 mr-2">
            <button onClick={() => setLanguage('en')} className={`transition-colors ${lang === 'en' ? 'text-brandGold' : 'hover:text-white'}`}>EN</button>
            <span>|</span>
            <button onClick={() => setLanguage('ru')} className={`transition-colors ${lang === 'ru' ? 'text-brandGold' : 'hover:text-white'}`}>RU</button>
            <span>|</span>
            <button onClick={() => setLanguage('am')} className={`transition-colors ${lang === 'am' ? 'text-brandGold' : 'hover:text-white'}`}>AM</button>
          </div>

          {user ? (
            <>
              <Link href={user.role === 'ADMIN' ? '/admin/schedule' : user.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard'} className="hover:text-brandGold transition-colors font-bold">
                Dashboard
              </Link>
              <button onClick={() => { logout(); router.push('/'); }} className="text-white/60 hover:text-white transition-colors">Sign Out</button>
            </>
          ) : (
            <Link href="/login" className="hover:text-brandGold transition-colors">{t.nav.signIn}</Link>
          )}
          
          <Link href="/book">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-brandTeal shadow px-5 py-2.5 rounded-full hover:bg-brandTealLight transition-all"
            >
              {t.nav.bookNow}
            </motion.div>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden z-50 p-2 text-white/80 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-0 right-0 bg-brandTealDark/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-6 shadow-2xl md:hidden z-40"
            >
              <Link href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-white/90 hover:text-brandGold transition-colors">{t.nav.about}</Link>
              <Link href="/#services" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-white/90 hover:text-brandGold transition-colors">{t.nav.services}</Link>
              <Link href="/#doctors" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-white/90 hover:text-brandGold transition-colors">{t.nav.doctors}</Link>
              <Link href="/#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-white/90 hover:text-brandGold transition-colors">{t.nav.contact}</Link>
              <div className="h-[1px] bg-white/10 w-full"></div>

              {/* Mobile Language Switcher Segmented Control */}
              <div className="flex justify-between items-center bg-white/5 p-1.5 rounded-xl border border-white/10 mt-2">
                <button onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2.5 text-center rounded-lg text-sm font-bold transition-all ${lang === 'en' ? 'bg-brandTeal text-white shadow-md' : 'text-white/50 hover:text-white'}`}>English</button>
                <button onClick={() => { setLanguage('ru'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2.5 text-center rounded-lg text-sm font-bold transition-all ${lang === 'ru' ? 'bg-brandTeal text-white shadow-md' : 'text-white/50 hover:text-white'}`}>Русский</button>
                <button onClick={() => { setLanguage('am'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2.5 text-center rounded-lg text-sm font-bold transition-all ${lang === 'am' ? 'bg-brandTeal text-white shadow-md' : 'text-white/50 hover:text-white'}`}>Հայերեն</button>
              </div>

              {user ? (
                <>
                  <Link href={user.role === 'ADMIN' ? '/admin/schedule' : user.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard'} onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-brandGold hover:text-white transition-colors mt-2">
                    Dashboard
                  </Link>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); router.push('/'); }} className="text-xl font-medium text-white/50 text-left hover:text-white transition-colors mt-2">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-xl font-medium text-white/90 hover:text-brandGold transition-colors mt-2">{t.nav.signIn}</Link>
              )}
              
              <Link href="/book" onClick={() => setIsMobileMenuOpen(false)} className="bg-brandTeal text-center w-full shadow px-5 py-4 rounded-xl font-bold hover:bg-brandTealLight transition-all text-white mt-2">
                {t.nav.bookNow}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.div>
  );
}
