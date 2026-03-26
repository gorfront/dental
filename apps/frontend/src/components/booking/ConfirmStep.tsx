"use client";
import { Service } from "@/types";
import { doctors } from "@/lib/constants";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

export function ConfirmStep({ 
  control, 
  prevStep, 
  watch, 
  services,
  isSubmitting 
}: { 
  control: any; 
  prevStep: () => void;
  watch: any;
  services: Service[];
  isSubmitting: boolean;
}) {
  const lang = useLanguageStore((state) => state.lang);
  const t = dictionaries[lang || 'en'];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-serif text-gray-900 mb-6 px-1">{t.wizard.confirmBooking}</h2>

      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm mb-8">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="flex gap-3">
            <div className="pt-0.5">✨</div>
            <div>
              <p className="text-xs text-gray-400">{t.wizard.summaryService}</p>
              <p className="font-medium text-sm text-gray-800">{services.find(s => s.id === watch('serviceId'))?.title || 'Selected Service'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="pt-0.5">👨‍⚕️</div>
            <div>
              <p className="text-xs text-gray-400">{t.wizard.summaryDoctor}</p>
              <p className="font-medium text-sm text-gray-800">{doctors.find(d => d.id === watch('doctorId'))?.name || 'Selected Doctor'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="pt-0.5">📅</div>
            <div>
              <p className="text-xs text-gray-400">{t.wizard.summaryDate}</p>
              <p className="font-medium text-sm text-gray-800">{watch('date') || 'Selected Date'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="pt-0.5">🕒</div>
            <div>
              <p className="text-xs text-gray-400">{t.wizard.summaryTime}</p>
              <p className="font-medium text-sm text-gray-800">{watch('time') || 'Selected Time'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="pt-0.5">⏱️</div>
            <div>
              <p className="text-xs text-gray-400">{t.wizard.summaryDuration}</p>
              <p className="font-medium text-sm text-gray-800">{services.find(s => s.id === watch('serviceId'))?.duration || 'Variable'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="pt-0.5">💰</div>
            <div>
              <p className="text-xs text-gray-400">{t.wizard.summaryCost}</p>
              <p className="font-medium text-sm text-gray-800">{services.find(s => s.id === watch('serviceId'))?.price || 'Variable'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">{t.wizard.yourName}</label>
          <input {...control.register('name')} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-brandTeal outline-none" placeholder="Gor" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">{t.wizard.phone}</label>
          <input {...control.register('phone')} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-brandTeal outline-none" placeholder="+37498046084" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">{t.wizard.notes}</label>
          <input {...control.register('notes')} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-brandTeal outline-none" placeholder="hello" />
        </div>

        <div className="mt-8 flex justify-between pt-4">
          <button type="button" onClick={prevStep} className="bg-white border text-gray-600 border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            {t.wizard.back}
          </button>
          <button type="submit" disabled={isSubmitting} className="bg-[#D0A752] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#BF9641] shadow-md transition-colors disabled:opacity-70">
            {isSubmitting ? t.wizard.confirming : t.wizard.confirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
