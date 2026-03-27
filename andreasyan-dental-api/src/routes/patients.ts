import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { users, patients, appointments, toothChart, xrays, clinicalNotes, invoices, services, doctors } from "../db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

// All patient routes require auth
router.use(requireAuth);

// ── GET /api/patients  (doctor/admin only) ────────────────────────────────
router.get("/", requireRole("doctor", "admin"), async (req: Request, res: Response) => {
  const rows = await db
    .select({
      patient: patients,
      user: { id: users.id, email: users.email, fullName: users.fullName, phone: users.phone, avatarUrl: users.avatarUrl },
    })
    .from(patients)
    .innerJoin(users, eq(patients.userId, users.id))
    .orderBy(asc(users.fullName));

  return res.json(rows);
});

// ── GET /api/patients/:id ─────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  // Patients can only fetch their own record
  if (req.user!.role === "patient" && req.user!.patientId !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const [row] = await db
    .select({
      patient: patients,
      user: { id: users.id, email: users.email, fullName: users.fullName, phone: users.phone, avatarUrl: users.avatarUrl, createdAt: users.createdAt },
    })
    .from(patients)
    .innerJoin(users, eq(patients.userId, users.id))
    .where(eq(patients.id, id));

  if (!row) return res.status(404).json({ error: "Patient not found" });
  return res.json(row);
});

// ── PUT /api/patients/:id ─────────────────────────────────────────────────
const updatePatientSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
}).partial();

router.put("/:id", validate(updatePatientSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.user!.role === "patient" && req.user!.patientId !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const [updated] = await db.update(patients).set({ ...req.body, updatedAt: new Date() })
    .where(eq(patients.id, id)).returning();
  return res.json(updated);
});

// ── GET /api/patients/:id/appointments ────────────────────────────────────
router.get("/:id/appointments", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.user!.role === "patient" && req.user!.patientId !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const rows = await db
    .select({
      appointment: appointments,
      service: { id: services.id, name: services.name, icon: services.icon, category: services.category },
      doctor: { id: doctors.id, specialty: doctors.specialty },
      doctorUser: { fullName: users.fullName, avatarUrl: users.avatarUrl },
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(users, eq(doctors.userId, users.id))
    .where(eq(appointments.patientId, id))
    .orderBy(desc(appointments.date), desc(appointments.time));

  return res.json(rows);
});

// ── GET /api/patients/:id/tooth-chart ─────────────────────────────────────
router.get("/:id/tooth-chart", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.user!.role === "patient" && req.user!.patientId !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const teeth = await db.select().from(toothChart)
    .where(eq(toothChart.patientId, id))
    .orderBy(asc(toothChart.toothNumber));
  return res.json(teeth);
});

// ── PUT /api/patients/:id/tooth-chart/:toothNumber ────────────────────────
const updateToothSchema = z.object({
  status: z.enum(["healthy", "cavity", "filling", "crown", "missing", "implant", "bridge", "root_canal"]),
  notes: z.string().optional(),
});

router.put("/:id/tooth-chart/:toothNumber", requireRole("doctor", "admin"), validate(updateToothSchema), async (req: Request, res: Response) => {
  const { id, toothNumber } = req.params;
  const [existing] = await db.select().from(toothChart)
    .where(and(eq(toothChart.patientId, id), eq(toothChart.toothNumber, Number(toothNumber))));

  if (existing) {
    const [updated] = await db.update(toothChart)
      .set({ ...req.body, treatedBy: req.user!.doctorId ?? null, treatedAt: new Date(), updatedAt: new Date() })
      .where(eq(toothChart.id, existing.id)).returning();
    return res.json(updated);
  } else {
    const [created] = await db.insert(toothChart).values({
      patientId: id, toothNumber: Number(toothNumber), ...req.body,
      treatedBy: req.user!.doctorId ?? null, treatedAt: new Date(),
    }).returning();
    return res.status(201).json(created);
  }
});

// ── GET /api/patients/:id/xrays ───────────────────────────────────────────
router.get("/:id/xrays", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.user!.role === "patient" && req.user!.patientId !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const rows = await db
    .select({
      xray: xrays,
      doctor: { fullName: users.fullName },
    })
    .from(xrays)
    .innerJoin(doctors, eq(xrays.uploadedBy, doctors.id))
    .innerJoin(users, eq(doctors.userId, users.id))
    .where(eq(xrays.patientId, id))
    .orderBy(desc(xrays.takenAt));
  return res.json(rows);
});

// ── GET /api/patients/:id/notes ───────────────────────────────────────────
router.get("/:id/notes", requireRole("doctor", "admin"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const rows = await db
    .select({
      note: clinicalNotes,
      doctor: { fullName: users.fullName },
    })
    .from(clinicalNotes)
    .innerJoin(doctors, eq(clinicalNotes.doctorId, doctors.id))
    .innerJoin(users, eq(doctors.userId, users.id))
    .where(eq(clinicalNotes.patientId, id))
    .orderBy(desc(clinicalNotes.createdAt));
  return res.json(rows);
});

// ── POST /api/patients/:id/notes ──────────────────────────────────────────
const noteSchema = z.object({
  content: z.string().min(1),
  appointmentId: z.string().uuid().optional(),
  isPrivate: z.boolean().default(false),
});

router.post("/:id/notes", requireRole("doctor", "admin"), validate(noteSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.user!.doctorId) return res.status(403).json({ error: "Only doctors can add notes" });
  const [note] = await db.insert(clinicalNotes).values({
    patientId: id,
    doctorId: req.user!.doctorId,
    ...req.body,
  }).returning();
  return res.status(201).json(note);
});

// ── GET /api/patients/:id/invoices ────────────────────────────────────────
router.get("/:id/invoices", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.user!.role === "patient" && req.user!.patientId !== id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const rows = await db.select().from(invoices).where(eq(invoices.patientId, id)).orderBy(desc(invoices.createdAt));
  return res.json(rows);
});

export default router;
