"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionaries } from "@/i18n/dictionaries";

const LoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm({ setError, setMode }: { setError: (err: string) => void, setMode: (m: 'register') => void }) {
  const router = useRouter();
  const setLogin = useAuthStore(state => state.login);
  const lang = useLanguageStore((state) => state.lang);
  const t = dictionaries[lang || 'en'];

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: any) => {
    setError("");
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const { user, token } = await response.json();
        setLogin(user, token);
        if (user.role === 'ADMIN') router.push('/admin/schedule');
        else if (user.role === 'DOCTOR') router.push('/doctor/dashboard');
        else router.push('/patient/dashboard');
      } else {
        const errData = await response.json();
        setError(errData.error || "Authentication failed");
      }
    } catch (e) {
      // Fallback Demo logic for network errors
      let assignedRole = "PATIENT";
      if (data.email.includes("admin")) assignedRole = "ADMIN";
      if (data.email.includes("doctor")) assignedRole = "DOCTOR";
      
      setLogin({ id: "1", email: data.email, role: assignedRole }, "demo-token");
      
      if (assignedRole === 'ADMIN') router.push('/admin/schedule');
      else if (assignedRole === 'DOCTOR') router.push('/doctor/dashboard');
      else router.push('/patient/dashboard');
    }
  };

  const fillDemo = (role: string) => {
    setValue('email', `${role.toLowerCase()}@demo.com`);
    setValue('password', 'demo123');
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-1.5">{t.auth.email}</label>
          <input {...register("email")} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#107070] outline-none transition-colors" placeholder="you@email.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-1.5">{t.auth.password}</label>
          <input type="password" {...register("password")} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#107070] outline-none transition-colors" placeholder="••••••••" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full py-3.5 mt-2 bg-[#0B6B6B] text-white rounded-xl font-semibold hover:bg-[#085555] transition-colors disabled:opacity-70 shadow-md">
          {isSubmitting ? t.auth.signingIn : t.auth.submitSignIn}
        </button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-[1px] bg-gray-200"></div>
        <span className="text-xs text-gray-400 font-medium">{t.auth.orDemo}</span>
        <div className="flex-1 h-[1px] bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <button type="button" onClick={() => fillDemo('patient')} className="border border-gray-200 rounded-xl py-3 flex flex-col items-center justify-center gap-2 hover:border-[#107070] hover:bg-teal-50/50 transition-colors group bg-white">
          <span className="text-xl group-hover:scale-110 transition-transform">🧑‍🦱</span>
          <span className="text-xs font-bold text-gray-800">{t.auth.demoPatient}</span>
        </button>
        <button type="button" onClick={() => fillDemo('doctor')} className="border border-gray-200 rounded-xl py-3 flex flex-col items-center justify-center gap-2 hover:border-[#107070] hover:bg-teal-50/50 transition-colors group bg-white">
          <span className="text-xl group-hover:scale-110 transition-transform">👨‍⚕️</span>
          <span className="text-xs font-bold text-gray-800">{t.auth.demoDoctor}</span>
        </button>
        <button type="button" onClick={() => fillDemo('admin')} className="border border-gray-200 rounded-xl py-3 flex flex-col items-center justify-center gap-2 hover:border-[#107070] hover:bg-teal-50/50 transition-colors group bg-white">
          <span className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
          <span className="text-xs font-bold text-gray-800">{t.auth.demoAdmin}</span>
        </button>
      </div>
      <p className="text-center text-[10px] sm:text-xs text-gray-400 mb-8">{t.auth.demoHint}</p>
    </>
  );
}
