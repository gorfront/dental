"use client";
import { Home, Calendar, User as UserIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore(state => state.logout);

  const navItems = [
    { href: "/patient/dashboard", icon: Home, label: "Home" },
    { href: "/book", icon: Calendar, label: "Book" },
    { href: "/patient/profile", icon: UserIcon, label: "Profile" },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-softWhite pb-24 md:pb-0">
      {/* Top Navigation for Desktop and Mobile */}
      <header className="flex bg-white h-16 border-b border-gray-100 items-center px-4 md:px-8 justify-between shadow-sm sticky top-0 z-50">
         <h1 className="text-xl font-bold text-deepTeal">Patient Portal</h1>
         <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6">
              {navItems.map(item => (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-2 font-medium ${pathname === item.href ? 'text-warmGold' : 'text-gray-500 hover:text-deepTeal'}`}>
                      <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
              ))}
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Specific to Patient */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-3 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-deepTeal' : 'text-gray-400'}`}>
              <Icon className={`w-6 h-6 ${isActive ? 'fill-deepTeal/10' : ''}`} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
