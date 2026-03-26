"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2 } from "lucide-react";

export default function DoctorDashboard() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dummy teeth 11-18 (Upper Right)
  const teeth = [18, 17, 16, 15, 14, 13, 12, 11];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      alert(`Uploading ${files[0].name} for patient record...`);
      // Here we would use FormData to POST /api/xrays/upload
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-deepTeal/90 flex flex-col items-center justify-center backdrop-blur-sm transition-all">
          <div className="border-4 border-dashed border-warmGold p-20 rounded-3xl flex flex-col items-center text-white animate-pulse">
            <UploadCloud className="w-24 h-24 text-warmGold mb-8" />
            <h2 className="text-4xl font-light">Drop X-Ray to Upload</h2>
            <p className="text-lg text-gray-300 mt-4">File will be attached to current active patient</p>
          </div>
        </div>
      )}

      {/* Active Patient Details */}
      <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6"
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           onDrop={handleDrop}>
        <div>
          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wide">In Chair</span>
          <h2 className="text-2xl font-bold text-deepTeal mt-4">Alex Johnson</h2>
          <p className="text-sm text-gray-500 mb-4">Record #84729 • Age: 34 • Last visit: Aug 12, 2026</p>
          
          <div className="space-y-2 mt-4">
             <h3 className="text-sm font-semibold text-deepTeal">Medical Alerts</h3>
             <div className="flex gap-2">
                <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium">Penicillin Allergy</span>
                <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-md text-xs font-medium">Asthma</span>
             </div>
          </div>
        </div>

        <div className="p-4 bg-softWhite rounded-2xl border border-dashed border-gray-200 text-center cursor-pointer hover:bg-gray-50 transition-colors">
          <UploadCloud className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">Drag & Drop X-Rays Here</p>
        </div>

        <div>
          <h3 className="font-semibold text-deepTeal mb-2">Today's Notes</h3>
          <textarea className="w-full h-32 p-3 bg-softWhite rounded-xl border border-gray-200 resize-none outline-none focus:ring-2 focus:ring-deepTeal" placeholder="Write treatment notes..."></textarea>
          <button className="w-full py-3 bg-deepTeal text-white rounded-xl font-medium mt-4 hover:bg-deepTeal/90 transition-colors">Save Notes</button>
        </div>
        
        <div className="mt-4 border-t border-gray-100 pt-6">
          <h3 className="font-semibold text-deepTeal mb-4">Today's Queue</h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center p-3 bg-deepTeal/5 rounded-xl border border-deepTeal/10">
                <div>
                   <p className="font-semibold text-deepTeal text-sm">Alex Johnson</p>
                   <p className="text-xs text-gray-500">09:00 AM • Root Canal</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
             </div>
             <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                <div>
                   <p className="font-medium text-gray-700 text-sm">Sarah Lee</p>
                   <p className="text-xs text-gray-500">10:00 AM • Checkup</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
             </div>
             <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                <div>
                   <p className="font-medium text-gray-700 text-sm">Michael Chen</p>
                   <p className="text-xs text-gray-500">11:00 AM • Cleaning</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Interactive Dental Formula */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
        <h2 className="text-xl font-bold text-deepTeal mb-8">Dental Formula</h2>
        
        <div className="bg-softWhite p-8 rounded-3xl border border-gray-50 flex items-center justify-center">
            {/* Mock SVG Formula */}
            <svg viewBox="0 0 800 200" className="w-full max-w-2xl h-auto">
              {teeth.map((tooth, i) => (
                <g 
                  key={tooth} 
                  transform={`translate(${i * 90 + 50}, 50)`}
                  onClick={() => setSelectedTooth(tooth)}
                  className="cursor-pointer group"
                >
                  {/* Simplified tooth path */}
                  <path 
                    d="M20,0 C30,0 40,10 40,30 C40,60 30,80 20,80 C10,80 0,60 0,30 C0,10 10,0 20,0 Z" 
                    className={`transition-all duration-300 ${selectedTooth === tooth ? 'fill-blue-500' : 'fill-white stroke-gray-300 group-hover:fill-blue-50'}`}
                    strokeWidth="2"
                  />
                  <text x="20" y="-15" textAnchor="middle" className="text-sm font-bold fill-deepTeal">{tooth}</text>
                </g>
              ))}
            </svg>
        </div>

        <AnimatePresence>
          {selectedTooth && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-deepTeal">Tooth #{selectedTooth} Details</h3>
                <button onClick={() => setSelectedTooth(null)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
              </div>
              <div className="flex gap-4">
                  <button className="px-4 py-2 bg-red-100 text-red-600 font-medium rounded-xl hover:bg-red-200 transition-colors">Mark Caries</button>
                  <button className="px-4 py-2 bg-blue-100 text-blue-600 font-medium rounded-xl hover:bg-blue-200 transition-colors">Mark Filling</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors">Extract</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
