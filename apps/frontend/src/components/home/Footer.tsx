import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 px-6 bg-brandGray border-t border-gray-200 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6 md:mb-0">
        <div className="w-5 h-5 bg-brandGold rounded-sm transform rotate-45"></div>
        <span className="font-bold text-gray-800 tracking-wide text-lg ml-1">Andreasyan Dental</span>
      </div>
      <p className="font-medium">© 2026 DentalPro Clinics. All rights reserved.</p>
      <div className="flex gap-8 mt-6 md:mt-0 font-medium">
        <Link href="#" className="hover:text-brandTeal transition-colors">Instagram</Link>
        <Link href="#" className="hover:text-brandTeal transition-colors">Facebook</Link>
        <Link href="#" className="hover:text-brandTeal transition-colors">WhatsApp</Link>
      </div>
    </footer>
  );
}
