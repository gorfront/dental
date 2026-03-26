"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2 } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

import { useServices } from "@/hooks/useServices";
import { ServiceStep } from "./booking/ServiceStep";
import { DoctorStep } from "./booking/DoctorStep";
import { DateTimeStep } from "./booking/DateTimeStep";
import { ConfirmStep } from "./booking/ConfirmStep";

const BookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  doctorId: z.string().min(1, "Please select a doctor"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  name: z.string().min(2, "Name required"),
  phone: z.string().min(10, "Phone number required"),
  notes: z.string().optional()
});

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { services } = useServices();

  useEffect(() => {
    setMounted(true);
  }, []);

  const lang = useLanguageStore((state) => state.lang);
  const t = dictionaries[mounted ? lang : 'en'] || dictionaries['en'];

  const { control, handleSubmit, watch } = useForm({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      serviceId: "", doctorId: "", date: "30 Mar", time: "", name: "", phone: "", notes: ""
    }
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Booking Confirmed! (Demo Mode)");
      setIsSubmitting(false);
      setStep(1); // Reset wizard
    }, 1500);
  };

  const stepsHeader = [t.wizard?.step1, t.wizard?.step2, t.wizard?.step3, t.wizard?.step4];

  return (
    <div className="w-full">
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm flex items-center justify-between mb-8 max-w-3xl mx-auto border border-white/20 relative z-20">
        {stepsHeader.map((lbl, idx) => {
          const stepNum = idx + 1;
          const isCompleted = step > stepNum;
          const isActive = step === stepNum;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center relative group">
              {idx !== 3 && (
                <div className={`absolute top-4 left-[60%] right-[-40%] h-[2px] ${step > stepNum ? 'bg-brandTeal' : 'bg-gray-200'}`}></div>
              )}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm relative z-10 transition-colors ${isCompleted ? 'bg-brandTeal text-white' : isActive ? 'bg-brandTeal text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
              </div>
              <p className={`text-xs mt-3 px-2 text-center ${isActive ? 'text-brandTeal font-medium' : isCompleted ? 'text-brandTeal' : 'text-gray-400'}`}>{lbl}</p>
            </div>
          )
        })}
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {step === 1 && <ServiceStep control={control} watch={watch} services={services} nextStep={nextStep} />}
                {step === 2 && <DoctorStep control={control} watch={watch} nextStep={nextStep} prevStep={prevStep} />}
                {step === 3 && <DateTimeStep control={control} watch={watch} nextStep={nextStep} prevStep={prevStep} />}
                {step === 4 && <ConfirmStep control={control} watch={watch} services={services} prevStep={prevStep} isSubmitting={isSubmitting} />}
              </motion.div>
            </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
