import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { appointments, patients, doctors, services, users, invoices } from "../db/schema";
import { eq, and, gte, lte, asc, desc, ne } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();
router.use(requireAuth);

// ── GET /api/appointments  (admin: all, doctor: own, patient: own) ─────────
router.get("/", async (req: Request, res: Response) => {
  const { from, to, date, status, doctorId, patientId } = req.query as Record<string, string>;

  const rows = await db
    .select({
      appointment: appointments,
      service: { id: services.id, name: services.name, icon: services.icon, category: services.category },
      patient: { id: patients.id, isVip: patients.isVip },
      patientUser: { fullName: users.fullName, phone: users.phone, avatarUrl: users.avatarUrl },
      doctor: { id: doctors.id, specialty: doctors.specialty, color: doctors.color },
      doctorUser: { fullName: users.fullName },
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    // patient user join (alias workaround — join twice via different fields)
    .innerJoin(users, eq(patients.userId, users.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .orderBy(desc(appointments.date), asc(appointments.time));

  let filtered = rows;

  // Role-based filtering
  if (req.user!.role === "patient") {
    filtered = filtered.filter(r => r.patient.id === req.user!.patientId);
  } else if (req.user!.role === "doctor") {
    filtered = filtered.filter(r => r.doctor.id === req.user!.doctorId);
  }

  // Query filters
  if (date) filtered = filtered.filter(r => r.appointment.date === date);
  if (from) filtered = filtered.filter(r => r.appointment.date >= from);
  if (to) filtered = filtered.filter(r => r.appointment.date <= to);
  if (status) filtered = filtered.filter(r => r.appointment.status === status);
  if (doctorId) filtered = filtered.filter(r => r.doctor.id === doctorId);
  if (patientId && req.user!.role !== "patient") filtered = filtered.filter(r => r.patient.id === patientId);

  return res.json(filtered);
});

// ── POST /api/appointments ────────────────────────────────────────────────
const createSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().int().positive(),
  room: z.string().optional(),
  notes: z.string().optional(),
  price: z.string().optional(),
});

router.post("/", validate(createSchema), async (req: Request, res: Response) => {
  // Check for conflicts
  const conflict = await db.select().from(appointments).where(
    and(
      eq(appointments.doctorId, req.body.doctorId),
      eq(appointments.date, req.body.date),
      eq(appointments.time, req.body.time),
      ne(appointments.status, "cancelled"),
    )
  );
  if (conflict.length > 0) {
    return res.status(409).json({ error: "Time slot already booked for this doctor" });
  }

  // Patients can only book for themselves
  if (req.user!.role === "patient" && req.body.patientId !== req.user!.patientId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const [appt] = await db.insert(appointments).values(req.body).returning();

  // Auto-create invoice
  if (req.body.price) {
    await db.insert(invoices).values({
      patientId: req.body.patientId,
      appointmentId: appt.id,
      amount: req.body.price,
      dueDate: req.body.date,
    });
  }

  return res.status(201).json(appt);
});

// ── GET /api/appointments/:id ─────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  const [row] = await db
    .select({
      appointment: appointments,
      service: services,
      patient: { id: patients.id, allergies: patients.allergies, medicalNotes: patients.medicalNotes, isVip: patients.isVip },
      patientUser: { fullName: users.fullName, phone: users.phone, avatarUrl: users.avatarUrl },
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(users, eq(patients.userId, users.id))
    .where(eq(appointments.id, req.params.id));

  if (!row) return res.status(404).json({ error: "Appointment not found" });

  // Access control
  if (req.user!.role === "patient" && row.patient.id !== req.user!.patientId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return res.json(row);
});

// ── PATCH /api/appointments/:id/status ────────────────────────────────────
const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "waiting", "inchair", "completed", "cancelled", "no_show"]),
  notes: z.string().optional(),
});

router.patch("/:id/status", requireRole("doctor", "admin"), validate(statusSchema), async (req: Request, res: Response) => {
  const [updated] = await db.update(appointments)
    .set({ status: req.body.status, notes: req.body.notes, updatedAt: new Date() })
    .where(eq(appointments.id, req.params.id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Appointment not found" });
  return res.json(updated);
});

// ── PATCH /api/appointments/:id  (reschedule) ─────────────────────────────
const rescheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  doctorId: z.string().uuid().optional(),
  room: z.string().optional(),
});

router.patch("/:id", requireRole("doctor", "admin"), validate(rescheduleSchema), async (req: Request, res: Response) => {
  const [updated] = await db.update(appointments)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(appointments.id, req.params.id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Appointment not found" });
  return res.json(updated);
});

// ── DELETE /api/appointments/:id  (cancel) ────────────────────────────────
router.delete("/:id", requireRole("admin"), async (req: Request, res: Response) => {
  const [deleted] = await db.delete(appointments)
    .where(eq(appointments.id, req.params.id))
    .returning();
  if (!deleted) return res.status(404).json({ error: "Appointment not found" });
  return res.json({ message: "Appointment deleted" });
});

export default router;
