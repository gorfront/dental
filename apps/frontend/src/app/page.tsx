"use client";
import { useState } from "react";
import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { Services } from "@/components/home/Services";
import { Doctors } from "@/components/home/Doctors";
import { PriorityBanner } from "@/components/home/PriorityBanner";
import { FooterCTA } from "@/components/home/FooterCTA";
import { Footer } from "@/components/home/Footer";
import { useServices } from "@/hooks/useServices";
import { Doctor } from "@/types";

export default function Home() {
  const { services } = useServices();

  const doctors: Doctor[] = [
    {
      id: "d1",
      bg: "bg-teal-600", color: "text-white",
      name: "Dr. Armen Andreasyan", spec: "Implantology & Oral Surgery",
      fullDesc: "Specializes in advanced surgical procedures, complex implants, and complete oral rehabilitation utilizing 3D scanning.",
      rating: "4.9", exp: "14 yrs"
    },
    {
      id: "d2",
      bg: "bg-yellow-500", color: "text-brandDark",
      name: "Dr. Nare Petrosyan", spec: "Aesthetic Dentistry",
      fullDesc: "Expert in porcelain veneers, composite bonding, and smile makeovers. Transforming smiles with artistic precision.",
      rating: "4.8", exp: "9 yrs"
    },
    {
      id: "d3",
      bg: "bg-teal-500", color: "text-white",
      name: "Dr. Sargis Hakobyan", spec: "Orthodontics",
      fullDesc: "Leading specialist in Invisalign and traditional braces. Creating perfectly aligned, healthy smiles for patients of all ages.",
      rating: "4.7", exp: "7 yrs"
    },
  ];

  return (
    <div className="min-h-screen bg-brandGray font-sans text-gray-800 overflow-x-hidden">
      <Hero />
      <Stats />
      <Services services={services} />
      <Doctors doctors={doctors} />
      <PriorityBanner />
      <FooterCTA />
      <Footer />
    </div>
  );
}
