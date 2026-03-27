import { Router, Request, Response } from "express";
import { db } from "../db";
import { appointments, patients, users, doctors, invoices, services } from "../db/schema";
import { eq, gte, lte, and, count, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();
router.use(requireAuth, requireRole("admin"));

// ── GET /api/admin/stats ──────────────────────────────────────────────────
router.get("/stats", async (req: Request, res: Response) => {
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [todayCount] = await db.select({ count: count() }).from(appointments)
    .where(eq(appointments.date, today));

  const [totalPatients] = await db.select({ count: count() }).from(patients);

  const [monthPatients] = await db.select({ count: count() }).from(appointments)
    .where(gte(appointments.date, monthAgo));

  const weekRevenue = await db.select({ total: sql<string>`coalesce(sum(amount), 0)` })
    .from(invoices).where(and(gte(invoices.createdAt, new Date(weekAgo)), eq(invoices.paid, true)));

  const pendingInvoices = await db.select({ count: count() })
    .from(invoices).where(eq(invoices.paid, false));

  return res.json({
    todayAppointments: Number(todayCount.count),
    totalPatients: Number(totalPatients.count),
    monthAppointments: Number(monthPatients.count),
    weekRevenue: Number(weekRevenue[0]?.total ?? 0),
    pendingInvoices: Number(pendingInvoices[0]?.count ?? 0),
  });
});

// ── GET /api/admin/schedule?from=...&to=... ───────────────────────────────
router.get("/schedule", async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };
  const today = new Date().toISOString().split("T")[0];
  const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const rows = await db
    .select({
      appointment: appointments,
      service: { id: services.id, name: services.name, icon: services.icon },
      patient: { id: patients.id },
      patientUser: { fullName: users.fullName, phone: users.phone },
      doctor: { id: doctors.id, color: doctors.color },
      doctorUser: { fullName: users.fullName },
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(users, eq(patients.userId, users.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id));

  const f = from || today;
  const t = to || weekEnd;
  const filtered = rows.filter(r => r.appointment.date >= f && r.appointment.date <= t);

  return res.json(filtered);
});

// ── GET /api/admin/revenue?period=week|month|year ─────────────────────────
router.get("/revenue", async (req: Request, res: Response) => {
  const { period = "week" } = req.query as { period?: string };
  const days = period === "year" ? 365 : period === "month" ? 30 : 7;
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${invoices.createdAt})::date`,
      total: sql<string>`sum(${invoices.amount})`,
    })
    .from(invoices)
    .where(gte(invoices.createdAt, new Date(from)))
    .groupBy(sql`date_trunc('day', ${invoices.createdAt})::date`)
    .orderBy(sql`date_trunc('day', ${invoices.createdAt})::date`);

  return res.json(rows);
});

// ── PATCH /api/admin/invoices/:id/pay ─────────────────────────────────────
router.patch("/invoices/:id/pay", async (req: Request, res: Response) => {
  const { id } = req.params;
  const [updated] = await db.update(invoices)
    .set({ paid: true, paidAt: new Date() })
    .where(eq(invoices.id, id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Invoice not found" });
  return res.json(updated);
});

// ── PUT /api/admin/users/:id/role ─────────────────────────────────────────
router.put("/users/:id/role", async (req: Request, res: Response) => {
  const { role } = req.body;
  if (!["patient", "doctor", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const [updated] = await db.update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, req.params.id))
    .returning();
  if (!updated) return res.status(404).json({ error: "User not found" });
  return res.json(updated);
});

// ── DELETE /api/admin/users/:id  (deactivate) ─────────────────────────────
router.delete("/users/:id", async (req: Request, res: Response) => {
  const [updated] = await db.update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, req.params.id))
    .returning();
  if (!updated) return res.status(404).json({ error: "User not found" });
  return res.json({ message: "User deactivated" });
});

export default router;
