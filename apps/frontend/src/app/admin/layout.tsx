"use client";

import { LayoutDashboard, Calendar as CalendarIcon, Users, Settings, Activity, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore(state => state.logout);

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/schedule", icon: CalendarIcon, label: "Master Schedule" },
    { href: "/admin/patients", icon: Users, label: "Patient CRM" },
  ];

  return (
    <div className="min-h-screen bg-softWhite flex pt-[76px]">
      <aside className="w-64 bg-[#111827] text-white flex flex-col hidden md:flex fixed h-[calc(100vh-76px)] shadow-2xl z-20">
        <div className="p-8 font-bold text-2xl tracking-tight text-white flex items-center gap-2">
          <Activity className="text-warmGold w-6 h-6" /> Admin<span className="text-gray-400 font-light">Panel</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-deepTeal text-white shadow-lg' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={() => { logout(); router.push('/'); }} className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-300 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all">
             <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-8">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <div>
             <h2 className="text-xl font-bold text-gray-800">Clinic Overview</h2>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-deepTeal text-white flex items-center justify-center font-bold">A</div>
              <button onClick={() => { logout(); router.push('/'); }} className="md:hidden text-gray-400 hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
           </div>
        </header>
        {children}
      </main>
    </div>
  );
}
