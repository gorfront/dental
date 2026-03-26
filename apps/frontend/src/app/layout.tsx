import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Navbar } from "@/components/home/Navbar";

export const metadata: Metadata = {
  title: "Premium Dental Clinic",
  description: "Experience the future of dentistry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
