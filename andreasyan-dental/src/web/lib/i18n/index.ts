import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import ru from "./locales/ru";
import am from "./locales/am";

const savedLang = typeof window !== "undefined" ? localStorage.getItem("lang") || "en" : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    am: { translation: am },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;

export const LANGUAGES = [
  { code: "en", label: "EN", full: "English", flag: "🇬🇧" },
  { code: "ru", label: "RU", full: "Русский", flag: "🇷🇺" },
  { code: "am", label: "ՀՀ", full: "Հայերեն", flag: "🇦🇲" },
];

export function setLanguage(code: string) {
  i18n.changeLanguage(code);
  localStorage.setItem("lang", code);
}
