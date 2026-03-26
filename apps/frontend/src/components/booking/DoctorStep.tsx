"use client";
import { Controller } from "react-hook-form";
import { doctors } from "@/lib/constants";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

function Star({ fill, text, ...props }: any) {
  return (
    <svg viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}

export function DoctorStep({ 
  control, 
  nextStep, 
  prevStep, 
  watch 
}: { 
  control: any; 
  nextStep: () => void; 
  prevStep: () => void;
  watch: any;
}) {
  const lang = useLanguageStore((state) => state.lang);
  const t = dictionaries[lang || 'en'];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-serif text-gray-900 mb-6 px-1">{t.wizard.chooseDoctor}</h2>
      <div className="flex flex-col gap-4">
        <Controller name="doctorId" control={control} render={({ field }) => (
          <>
            {doctors.map(d => (
              <label key={d.id} className={`cursor-pointer bg-white p-5 rounded-[1.5rem] border ${field.value === d.id ? 'border-brandTeal ring-1 ring-brandTeal shadow-md' : 'border-gray-100 hover:border-gray-200 shadow-sm'} transition-all flex items-center gap-5`}>
                <input type="radio" className="hidden" {...field} value={d.id} />
                <div className={`w-16 h-16 rounded-2xl ${d.bg} flex items-end justify-center pt-2`}>
                  <div className="w-12 h-12 bg-black/10 rounded-t-full mix-blend-overlay"></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{d.name}</h3>
                  <p className="text-sm font-medium text-brandTeal">{d.spec}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Star fill text className="w-3 h-3 text-brandGold fill-brandGold" /> {d.rating} · {d.exp}
                  </p>
                </div>
              </label>
            ))}
          </>
        )} />
      </div>
      <div className="mt-8 flex justify-between">
        <button type="button" onClick={prevStep} className="bg-white border text-gray-600 border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
          {t.wizard.back}
        </button>
        <button type="button" onClick={nextStep} disabled={!watch('doctorId')} className="bg-[#317c7a] text-white px-6 py-3 rounded-xl font-medium hover:bg-brandTealLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {t.wizard.nextDateTime}
        </button>
      </div>
    </div>
  );
}
