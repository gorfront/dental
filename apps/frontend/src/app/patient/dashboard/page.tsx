"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

export default function PatientDashboard() {
  
  // Dummy query for patient appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: async () => [
        { id: 1, date: '2026-11-05', time: '09:00 AM', doctor: 'Dr. Sarah Smith', type: 'Root Canal Treatment', status: 'Upcoming' },
        { id: 2, date: '2026-10-15', time: '10:30 AM', doctor: 'Dr. David Jones', type: 'Checkup & Cleaning', status: 'Completed' },
        { id: 3, date: '2026-05-20', time: '14:00 PM', doctor: 'Dr. Emily Chen', type: 'Crown Fitting', status: 'Completed' },
        { id: 4, date: '2025-11-10', time: '11:15 AM', doctor: 'Dr. Sarah Smith', type: 'Initial Consultation', status: 'Completed' },
    ]
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-light text-deepTeal">Welcome back, <span className="font-semibold text-warmGold">Alex</span></h1>
        <p className="text-gray-500 mt-2">Here is your dental health overview.</p>
      </header>

      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-deepTeal">Upcoming Appointments</h2>
            <Link href="/patient/appointments" className="text-sm font-medium text-warmGold flex items-center hover:underline">
                View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
                <div className="h-32 bg-gray-100 animate-pulse rounded-2xl w-full"></div>
            ) : appointments?.map((app) => (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5 }}
                    key={app.id} 
                    className="bg-white p-6 rounded-3xl shadow-lg shadow-deepTeal/5 border border-gray-50 flex flex-col cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-warmGold"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-bold text-lg text-deepTeal">{app.type}</p>
                            <p className="text-sm text-gray-500">{app.doctor}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold tracking-wide uppercase">
                            {app.status}
                        </span>
                    </div>
                    <div className="mt-auto flex items-center gap-4 text-sm font-medium text-gray-600">
                        <span className="flex items-center gap-1 bg-softWhite px-3 py-1.5 rounded-lg"><Calendar className="w-4 h-4 text-deepTeal" /> {app.date}</span>
                        <span className="flex items-center gap-1 bg-softWhite px-3 py-1.5 rounded-lg"><Clock className="w-4 h-4 text-deepTeal" /> {app.time}</span>
                    </div>
                </motion.div>
            ))}

            {!isLoading && appointments?.length === 0 && (
                <div className="col-span-2 bg-white p-8 rounded-3xl border border-dashed border-gray-300 text-center flex flex-col items-center justify-center">
                    <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg text-gray-600 mb-4">You have no upcoming appointments.</p>
                    <Link href="/book" className="px-6 py-2 bg-warmGold text-deepTeal font-medium rounded-full hover:scale-105 transition-transform">
                        Book Now
                    </Link>
                </div>
            )}
        </div>
      </section>

      {/* Quick Actions / Document Section */}
      <section>
        <h2 className="text-xl font-semibold text-deepTeal mb-4 mt-8">Recent Documents</h2>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-2">
            
            <div className="flex items-center justify-between p-4 hover:bg-softWhite rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl group-hover:scale-110 transition-transform"><FileText className="w-6 h-6" /></div>
                    <div>
                        <p className="font-semibold text-deepTeal">Treatment Plan - Oct 2026</p>
                        <p className="text-xs text-gray-500">PDF Document • 2.4 MB</p>
                    </div>
                </div>
                <button className="text-warmGold opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm border border-warmGold px-4 py-1.5 rounded-full hover:bg-warmGold hover:text-white">
                    Download
                </button>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-softWhite rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl group-hover:scale-110 transition-transform"><FileText className="w-6 h-6" /></div>
                    <div>
                        <p className="font-semibold text-deepTeal">Panoramic X-Ray</p>
                        <p className="text-xs text-gray-500">DICOM Image • 15.1 MB</p>
                    </div>
                </div>
                <button className="text-warmGold opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm border border-warmGold px-4 py-1.5 rounded-full hover:bg-warmGold hover:text-white">
                    View
                </button>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-softWhite rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-500 rounded-xl group-hover:scale-110 transition-transform"><FileText className="w-6 h-6" /></div>
                    <div>
                        <p className="font-semibold text-deepTeal">Invoice #INV-2938</p>
                        <p className="text-xs text-gray-500">PDF Document • 1.1 MB</p>
                    </div>
                </div>
                <button className="text-warmGold opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm border border-warmGold px-4 py-1.5 rounded-full hover:bg-warmGold hover:text-white">
                    Download
                </button>
            </div>

        </div>
      </section>

    </div>
  );
}
