import { Router, Request, Response } from "express";
import { db } from "../db";
import { users, doctors, appointments, services, patients } from "../db/schema";
import { eq, and, gte, lte, asc, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// ── GET /api/doctors  (public) ────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  const rows = await db
    .select({
      doctor: doctors,
      user: { id: users.id, email: users.email, fullName: users.fullName, phone: users.phone, avatarUrl: users.avatarUrl },
    })
    .from(doctors)
    .innerJoin(users, eq(doctors.userId, users.id))
    .where(eq(users.isActive, true))
    .orderBy(asc(users.fullName));
  return res.json(rows);
});

// ── GET /api/doctors/:id ──────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  const [row] = await db
    .select({
      doctor: doctors,
      user: { id: users.id, email: users.email, fullName: users.fullName, phone: users.phone, avatarUrl: users.avatarUrl },
    })
    .from(doctors)
    .innerJoin(users, eq(doctors.userId, users.id))
    .where(eq(doctors.id, req.params.id));
  if (!row) return res.status(404).json({ error: "Doctor not found" });
  return res.json(row);
});

// ── GET /api/doctors/:id/slots?date=YYYY-MM-DD ────────────────────────────
router.get("/:id/slots", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.query as { date: string };
  if (!date) return res.status(400).json({ error: "date query param required (YYYY-MM-DD)" });

  // All time slots
  const ALL_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  ];

  // Booked slots for this doctor on this date
  const booked = await db.select({ time: appointments.time, duration: appointments.duration })
    .from(appointments)
    .where(and(
      eq(appointments.doctorId, id),
      eq(appointments.date, date),
      // not cancelled
    ));

  const bookedTimes = new Set(booked.map(b => b.time.slice(0, 5)));
  const slots = ALL_SLOTS.map(slot => ({
    time: slot,
    available: !bookedTimes.has(slot),
  }));

  return res.json({ date, doctorId: id, slots });
});

// ── GET /api/doctors/:id/appointments?date=... ────────────────────────────
router.get("/:id/appointments", requireRole("doctor", "admin"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, from, to } = req.query as { date?: string; from?: string; to?: string };

  // Enforce doctors can only see their own
  if (req.user!.role === "doctor" && req.user!.doctorId !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  let query = db
    .select({
      appointment: appointments,
      service: { id: services.id, name: services.name, icon: services.icon, duration: services.duration },
      patient: { id: patients.id },
      patientUser: { fullName: users.fullName, phone: users.phone, avatarUrl: users.avatarUrl },
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(users, eq(patients.userId, users.id))
    .where(eq(appointments.doctorId, id))
    .orderBy(asc(appointments.date), asc(appointments.time))
    .$dynamic();

  const rows = await query;

  // Filter in memory if date provided (simple approach)
  const filtered = date
    ? rows.filter(r => r.appointment.date === date)
    : from && to
    ? rows.filter(r => r.appointment.date >= from && r.appointment.date <= to)
    : rows;

  return res.json(filtered);
});

export default router;
