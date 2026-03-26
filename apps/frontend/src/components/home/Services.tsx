"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries, Language } from "@/i18n/dictionaries";
import { staggerContainer, fadeInUp } from "../ui/animations";
import { Service } from "@/types";

const getServiceDescription = (title: string, lang: Language) => {
  const t = title.toLowerCase();

  if (t.includes("caries") || t.includes("кариес") || t.includes("կարիես")) {
    return lang === 'ru' ? "Профессиональное и безболезненное лечение кариеса для восстановления здоровья зуба." :
      lang === 'am' ? "Կարիեսի պրոֆեսիոնալ և անցավ բուժում՝ ատամի առողջությունը վերականգնելու համար:" :
        "Professional and painless caries treatment to restore tooth health and structure.";
  }
  if (t.includes("endodontic") || t.includes("эндодонтическ") || t.includes("էնդոդոնտիկ") || t.includes("пульпит")) {
    return lang === 'ru' ? "Лечение корневых каналов для сохранения инфицированного зуба." :
      lang === 'am' ? "Արմատախողովակների բուժում՝ ինֆեկցված ատամը փրկելու համար:" :
        "Root canal treatment to save and restore infected teeth.";
  }
  if (t.includes("hygiene") || t.includes("гигиен") || t.includes("հիգիենա") || t.includes("airflow")) {
    return lang === 'ru' ? "Комплексная гигиена полости рта для предотвращения кариеса и заболеваний десен." :
      lang === 'am' ? "Բերանի խոռոչի համալիր հիգիենա՝ կարիեսը և լնդերի հիվանդությունները կանխելու համար:" :
        "Comprehensive oral hygiene to prevent decay and gum diseases.";
  }
  if (t.includes("extraction") || t.includes("удаление") || t.includes("հեռացում")) {
    return lang === 'ru' ? "Безопасное и безболезненное удаление зубов опытными хирургами-стоматологами." :
      lang === 'am' ? "Ատամների անվտանգ և անցավ հեռացում փորձառու վիրաբույժների կողմից:" :
        "Safe and pain-free tooth extraction by experienced dental surgeons.";
  }
  if (t.includes("whitening") || t.includes("отбеливание") || t.includes("սպիտակեցում")) {
    return lang === 'ru' ? "Профессиональное отбеливание для мгновенной и сияющей улыбки." :
      lang === 'am' ? "Պրոֆեսիոնալ սպիտակեցում՝ ակնթարթային և փայլուն ժպիտի համար:" :
        "Professional in-office whitening for an instantly brighter, radiant smile.";
  }
  if (t.includes("implant") || t.includes("имплантат") || t.includes("իմպլանտ")) {
    return lang === 'ru' ? "Надежная установка титановых имплантатов, которые ощущаются как родные зубы." :
      lang === 'am' ? "Տիտանե իմպլանտների հուսալի տեղադրում, որոնք ունեն բնական տեսք:" :
        "Permanent, titanium-based replacements for missing teeth looking totally natural.";
  }
  if (t.includes("consultation") || t.includes("консультация") || t.includes("խորհրդատվություն")) {
    return lang === 'ru' ? "Комплексный осмотр и составление индивидуального плана лечения." :
      lang === 'am' ? "Համալիր զննում և բուժման անհատական պլանի կազմում:" :
        "Comprehensive examination and personalized treatment plan creation.";
  }
  if (t.includes("crown") || t.includes("коронк") || t.includes("պսակ") || t.includes("կորոնկա")) {
    return lang === 'ru' ? "Прочные и эстетичные коронки для восстановления разрушенных зубов." :
      lang === 'am' ? "Ամուր և էսթետիկ պսակներ վնասված ատամների վերականգնման համար:" :
        "Durable and esthetic crowns to restore damaged or weakened teeth.";
  }
  if (t.includes("veneer") || t.includes("винир") || t.includes("վինիր")) {
    return lang === 'ru' ? "Керамические виниры для создания безупречной голливудской улыбки." :
      lang === 'am' ? "Կերամիկական վինիրներ անթերի հոլիվուդյան ժպիտ ստանալու համար:" :
        "Custom-made ceramic veneers for a flawless Hollywood smile.";
  }
  if (t.includes("braces") || t.includes("брекет") || t.includes("բրեկետ")) {
    return lang === 'ru' ? "Ортодонтическое лечение для выравнивания зубов и исправления прикуса." :
      lang === 'am' ? "Օրթոդոնտիկ բուժում ատամների ուղղման և կծվածքի շտկման համար:" :
        "Orthodontic treatment to align teeth and correct your bite.";
  }

  return lang === 'ru' ? "Премиальная стоматологическая процедура для здоровья вашей улыбки." :
    lang === 'am' ? "Պրեմիում ատամնաբուժական պրոցեդուրա ձեր ժպիտի առողջության համար:" :
      "Premium dental procedure focused on your long-term oral health.";
};

export function Services({ services }: { services: Service[] }) {
  const [mounted, setMounted] = useState(false);
  const lang = useLanguageStore((state) => state.lang) as Language;

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLang = mounted ? (lang || 'en') : 'en';
  const t = dictionaries[currentLang] || dictionaries['en'];

  const serviceBadge = currentLang === 'ru' ? 'Услуга' : currentLang === 'am' ? 'Ծառայություն' : 'Service';

  return (
    <section id="services" className="py-32 px-6 bg-brandGray relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brandTeal/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-16">
          <motion.span variants={fadeInUp} className="text-brandTeal text-xs font-bold uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full">{t.services.tag}</motion.span>
          <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-serif text-[#1F2937] mt-6 mb-4">{t.services.titleLine1} <br /><span className="text-brandGold italic relative inline-block">{t.services.titleLine2}<div className="absolute bottom-1 left-0 w-full h-1 bg-brandGold/20"></div></span></motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-500 max-w-xl mx-auto font-light text-lg">{t.services.desc}</motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <Link href="/book" key={i}>
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 transition-all h-full cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brandTeal/0 to-brandTeal/[0.03] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="text-3xl bg-gray-50 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-brandGold/10 transition-colors">{s.icon}</div>
                  <span className="text-xs font-semibold text-brandTeal bg-teal-50 px-2.5 py-1 rounded-md uppercase tracking-wide">{serviceBadge}</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{s.title}</h3>
                  <p className="text-sm font-light text-gray-500 mt-1 h-10 overflow-hidden line-clamp-2 leading-relaxed">
                    {getServiceDescription(s.title, currentLang)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 text-sm relative z-10">
                  <span className="font-semibold text-brandTeal text-lg">{s.price}</span>
                  <span className="text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full">{s.duration}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}