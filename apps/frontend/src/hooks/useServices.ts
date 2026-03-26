"use client";
import { useState, useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";

const getServiceIcon = (nameEn: string): string => {
  const lowerName = (nameEn || "").toLowerCase();
  if (lowerName.includes("caries")) return "🦷";
  if (lowerName.includes("whitening")) return "✨";
  if (lowerName.includes("implant")) return "🔩";
  if (lowerName.includes("extraction")) return "🪥";
  if (lowerName.includes("crown")) return "👑";
  if (lowerName.includes("hygiene") || lowerName.includes("airflow")) return "🫧";
  return "📋";
};

export function useServices() {
  const lang = useLanguageStore((state) => state.lang);

  const [rawServices, setRawServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    setIsLoading(true);

    fetch(`${API_URL}/api/services`, { signal: abortController.signal })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then(data => {
        setRawServices(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => abortController.abort();
  }, []);

  const services = rawServices.map(s => {
    const localizedTitle =
      lang === 'ru' ? s.nameRu :
        lang === 'am' ? s.nameAm :
          s.nameEn;

    const durationText =
      lang === 'ru' ? 'мин' :
        lang === 'am' ? 'րոպե' :
          'min';

    return {
      id: s.id,
      title: localizedTitle || s.nameEn || "Dental Service",
      price: `${(s.price || 0).toLocaleString()} ֏`,
      duration: `${s.duration || 30} ${durationText}`,
      icon: getServiceIcon(s.nameEn)
    };
  });

  return { services, isLoading, error };
}