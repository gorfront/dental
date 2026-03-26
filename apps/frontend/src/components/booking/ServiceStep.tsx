"use client";
import { Controller } from "react-hook-form";
import { Service } from "@/types";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

export function ServiceStep({ 
  control, 
  services, 
  nextStep, 
  watch 
}: { 
  control: any; 
  services: Service[]; 
  nextStep: () => void; 
  watch: any;
}) {
  const lang = useLanguageStore((state) => state.lang);
  const t = dictionaries[lang || 'en'];

  return (
    <div className="w-full bg-brandGray">
      <h2 className="text-2xl font-serif text-gray-900 mb-6 px-1">{t.wizard.chooseService}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller name="serviceId" control={control} render={({ field }) => (
          <>
            {services.map(s => (
              <label key={s.id} className={`cursor-pointer bg-white p-6 rounded-[1.5rem] border ${field.value === s.id ? 'border-brandTeal ring-1 ring-brandTeal shadow-md' : 'border-gray-100 hover:border-gray-200 shadow-sm'} transition-all flex flex-col`}>
                <input type="radio" className="hidden" {...field} value={s.id} />
                <div className="text-2xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm font-medium text-gray-400">{s.duration} · {s.price}</p>
              </label>
            ))}
          </>
        )} />
      </div>
      <div className="mt-8 flex justify-end">
        <button type="button" onClick={nextStep} disabled={!watch('serviceId')} className="bg-[#317c7a] text-white px-6 py-3 rounded-xl font-medium hover:bg-brandTealLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {t.wizard.nextDoctor}
        </button>
      </div>
    </div>
  );
}
