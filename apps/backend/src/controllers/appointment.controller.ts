import { Request, Response } from 'express';
import { db } from '../config/database';
import { appointments, users } from '../models/schema';
import { z } from 'zod';
import { eq, and, gte, lt, ne } from 'drizzle-orm';

const CreateAppointmentSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  notes: z.string().optional()
});

export const getSlots = async (req: Request, res: Response) => {
  try {
    const { date, doctorId } = req.query;
    if (!date || !doctorId) {
      return res.status(400).json({ error: 'date and doctorId are required' });
    }

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const bookedAppointments = await db.select().from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId as string),
        gte(appointments.startTime, startOfDay),
        lt(appointments.startTime, endOfDay),
        ne(appointments.status, 'CANCELLED')
      ));

    const slots = [];
    for (let i = 9; i < 17; i++) {
        const slotStart = new Date(startOfDay);
        slotStart.setHours(i, 0, 0, 0);
        
        const isBooked = bookedAppointments.some((app) => 
            app.startTime.getTime() === slotStart.getTime()
        );

        if (!isBooked) {
            slots.push({ time: slotStart.toISOString() });
        }
    }
    
    res.json({ slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const data = CreateAppointmentSchema.parse(req.body);

    const [appointment] = await db.insert(appointments).values({
      patientId: data.patientId,
      doctorId: data.doctorId,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      notes: data.notes
    }).returning();

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Invalid data or server error' });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { aliasedTable } = require('drizzle-orm');
    const patients = aliasedTable(users, 'patients');
    const doctors = aliasedTable(users, 'doctors');

    const allAppointments = await db.select({
      appointment: appointments,
      patient: patients,
      doctor: doctors
    }).from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id));

    res.json({ appointments: allAppointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
