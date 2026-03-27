import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { services } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

// ── GET /api/services  (public) ───────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  const all = await db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.category));
  return res.json(all);
});

// ── GET /api/services/:id ─────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  const [svc] = await db.select().from(services).where(eq(services.id, req.params.id));
  if (!svc) return res.status(404).json({ error: "Service not found" });
  return res.json(svc);
});

const serviceSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().int().positive(),
  price: z.string(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ── POST /api/services  (admin only) ──────────────────────────────────────
router.post("/", requireAuth, requireRole("admin"), validate(serviceSchema), async (req: Request, res: Response) => {
  const [svc] = await db.insert(services).values(req.body).returning();
  return res.status(201).json(svc);
});

// ── PUT /api/services/:id  (admin only) ───────────────────────────────────
router.put("/:id", requireAuth, requireRole("admin"), validate(serviceSchema.partial()), async (req: Request, res: Response) => {
  const [updated] = await db.update(services)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(services.id, req.params.id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Service not found" });
  return res.json(updated);
});

// ── DELETE /api/services/:id  (admin only, soft delete) ───────────────────
router.delete("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  const [updated] = await db.update(services)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(services.id, req.params.id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Service not found" });
  return res.json({ message: "Service deactivated" });
});

export default router;
