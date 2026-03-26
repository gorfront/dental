"use client";
import { Controller } from "react-hook-form";
import { dates, times, disabledTimes } from "@/lib/constants";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

export function DateTimeStep({ 
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
      <h2 className="text-2xl font-serif text-gray-900 mb-6 px-1">{t.wizard.selectDateTime}</h2>

      <p className="text-sm font-bold text-gray-600 mb-4 px-1">{t.wizard.selectDate}</p>
      <div className="flex gap-3 overflow-x-auto pb-4 hide-scroll">
        <Controller name="date" control={control} render={({ field }) => (
          <>
            {dates.map((d, i) => (
              <label key={i} className={`flex-shrink-0 w-20 flex flex-col items-center justify-center p-3 rounded-[1rem] cursor-pointer border transition-colors ${field.value === (d.date + " " + d.month) ? 'bg-brandTeal border-brandTeal text-white shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 shadow-sm'}`}>
                <input type="radio" className="hidden" {...field} value={d.date + " " + d.month} />
                <span className="text-xs mb-1 font-medium">{d.day}</span>
                <span className="text-2xl font-bold">{d.date}</span>
                <span className="text-xs mt-1 opacity-80">{d.month}</span>
              </label>
            ))}
          </>
        )} />
      </div>

      <p className="text-sm font-bold text-gray-600 mb-4 mt-6 px-1">{t.wizard.availableTimes}</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <Controller name="time" control={control} render={({ field }) => (
          <>
            {times.map((timeString, i) => {
              const isDisabled = disabledTimes.includes(timeString);
              return (
                <label key={i} className={`flex items-center justify-center py-2.5 rounded-full text-sm font-medium border transition-colors ${isDisabled ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' : field.value === timeString ? 'bg-brandTeal border-brandTeal text-white shadow-md cursor-pointer' : 'bg-white border-gray-200 text-gray-700 hover:border-brandTeal cursor-pointer shadow-sm'}`}>
                  <input type="radio" className="hidden" {...field} value={timeString} disabled={isDisabled} />
                  {timeString}
                </label>
              )
            })}
          </>
        )} />
      </div>

      <div className="mt-10 flex justify-between">
        <button type="button" onClick={prevStep} className="bg-white border text-gray-600 border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
          {t.wizard.back}
        </button>
        <button type="button" onClick={nextStep} disabled={!watch('time') || !watch('date')} className="bg-[#0f605f] text-white px-6 py-3 rounded-xl font-medium hover:bg-brandTealLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {t.wizard.nextConfirm}
        </button>
      </div>
    </div>
  );
}
