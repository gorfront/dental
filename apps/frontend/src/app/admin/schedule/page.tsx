"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/useSocket";
import { Trash2 } from "lucide-react";

export default function AdminSchedule() {
  const socket = useSocket();

  // Mock initial state for doctors and their appointments
  const [appointments, setAppointments] = useState([
    { id: '1', patient: 'Alex Johnson', time: '09:00 AM', status: 'In Chair', doctorId: 'dr_smith' },
    { id: '2', patient: 'Sarah Lee', time: '10:00 AM', status: 'Scheduled', doctorId: 'dr_smith' },
    { id: '3', patient: 'Michael Chen', time: '11:00 AM', status: 'Confirmed', doctorId: 'dr_smith' },
    { id: '4', patient: 'Emma Watson', time: '09:30 AM', status: 'Scheduled', doctorId: 'dr_jones' },
    { id: '5', patient: 'James Bond', time: '13:00 PM', status: 'In Waiting Room', doctorId: 'dr_jones' },
    { id: '6', patient: 'Bruce Wayne', time: '10:00 AM', status: 'Scheduled', doctorId: 'dr_chen' },
    { id: '7', patient: 'Clark Kent', time: '11:30 AM', status: 'Scheduled', doctorId: 'dr_chen' },
    { id: '8', patient: 'Diana Prince', time: '14:00 PM', status: 'Confirmed', doctorId: 'dr_chen' },
    { id: '9', patient: 'Peter Parker', time: '09:00 AM', status: 'In Chair', doctorId: 'dr_adams' },
  ]);

  const doctors = [
    { id: 'dr_smith', name: 'Dr. Sarah Smith' },
    { id: 'dr_jones', name: 'Dr. David Jones' },
    { id: 'dr_chen', name: 'Dr. Emily Chen' },
    { id: 'dr_adams', name: 'Dr. Mark Adams' },
  ];

  // Socket listener for real-time cancellations (dissolve effect)
  useEffect(() => {
    if (socket) {
      socket.on('appointment_cancelled', (id: string) => {
        setAppointments(prev => prev.filter(app => app.id !== id));
      });
    }
  }, [socket]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (over && active.id !== over.id) {
      const activeId = active.id;
      const overId = over.id as string; // Doctor ID
      
      setAppointments((prev) => 
        prev.map(app => app.id === activeId ? { ...app, doctorId: overId } : app)
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Master Schedule</h1>
        <button onClick={() => socket?.emit('cancel_simulate', '1')} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
          Simulate Cancellation (Socket)
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doctor => (
            <DoctorColumn 
              key={doctor.id}
              doctor={doctor}
              items={appointments.filter(app => app.doctorId === doctor.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function DoctorColumn({ doctor, items }: { doctor: any, items: any[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: doctor.id });

  return (
    <div 
      ref={setNodeRef}
      className={`bg-white rounded-3xl p-6 border transition-colors ${isOver ? 'border-deepTeal bg-blue-50/30' : 'border-gray-100'} shadow-sm min-h-[500px] flex flex-col gap-4`}
    >
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-softWhite text-deepTeal font-bold flex items-center justify-center text-sm">
          {doctor.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <h2 className="text-lg font-bold text-deepTeal text-gray-800">{doctor.name}</h2>
      </div>

      <AnimatePresence>
        {items.map(app => (
          <DraggableAppointment key={app.id} app={app} />
        ))}
      </AnimatePresence>
      
      {items.length === 0 && (
        <div className="m-auto text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl p-8 w-full text-center">
          Drop appointments here
        </div>
      )}
    </div>
  );
}

function DraggableAppointment({ app }: { app: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-lg border-warmGold/50 scale-105' : 'hover:shadow-md'}`}
    >
      <div className="flex justify-between items-start">
        <p className="font-bold text-deepTeal">{app.patient}</p>
        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">{app.time}</span>
      </div>
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
         <span className="text-xs text-green-600 font-medium">{app.status}</span>
         <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    </motion.div>
  );
}
