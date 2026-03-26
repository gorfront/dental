import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'ru' | 'am';

interface LanguageStore {
  lang: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      lang: 'en',
      setLanguage: (lang) => set({ lang }),
    }),
    {
      name: 'dental-language-store',
    }
  )
);
