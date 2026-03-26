"use client";

import BookingWizard from "@/components/BookingWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";
import { useState, useEffect } from "react";

export default function BookPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lang = useLanguageStore((state) => state.lang);
  const t = dictionaries[mounted ? lang : 'en'];

  return (
    <div className="min-h-screen bg-brandGray flex flex-col pt-16 relative">
      <div className="block z-50">
         <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-md text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> {t.book.back}
         </Link>
      </div>

      <div className="absolute top-0 left-0 right-0 h-[350px] bg-gradient-to-br from-[#073636] via-brandTeal to-[#1A8282] z-0 shadow-inner"></div>
      
      <div className="relative z-10 w-full text-center mt-8 mb-12 text-white">
          <h1 className="text-4xl md:text-5xl font-serif mb-3">{t.book.title}</h1>
          <p className="text-white/80 font-light text-lg">{t.book.subtitle}</p>
      </div>

      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-32">
        <BookingWizard />
      </div>
    </div>
  );
}
