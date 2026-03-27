import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { users, patients, doctors } from "../db/schema";
import { eq } from "drizzle-orm";
import { supabase } from "../lib/supabase";
import { signToken } from "../lib/jwt";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(["patient", "doctor", "admin"]).default("patient"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req: Request, res: Response) => {
  const { email, password, fullName, phone, role } = req.body;

  // 1. Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (authError) return res.status(400).json({ error: authError.message });

  // 2. Create user in our DB
  const [user] = await db.insert(users).values({
    supabaseId: authData.user.id,
    email, fullName, phone, role,
  }).returning();

  // 3. Create role-specific record
  if (role === "patient") {
    await db.insert(patients).values({ userId: user.id });
  }

  // 4. Fetch patient/doctor id for token
  const patientRecord = role === "patient"
    ? (await db.select().from(patients).where(eq(patients.userId, user.id)))[0]
    : undefined;
  const doctorRecord = role === "doctor"
    ? (await db.select().from(doctors).where(eq(doctors.userId, user.id)))[0]
    : undefined;

  const token = signToken({
    userId: user.id,
    supabaseId: authData.user.id,
    email: user.email,
    role: user.role,
    patientId: patientRecord?.id,
    doctorId: doctorRecord?.id,
  });

  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    patientId: patientRecord?.id ?? null,
    doctorId: doctorRecord?.id ?? null,
  });
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Sign in via Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) return res.status(401).json({ error: "Invalid credentials" });

  // 2. Fetch our user record
  const [user] = await db.select().from(users).where(eq(users.supabaseId, authData.user.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.isActive) return res.status(403).json({ error: "Account is deactivated" });

  const patientRecord = user.role === "patient"
    ? (await db.select().from(patients).where(eq(patients.userId, user.id)))[0]
    : undefined;
  const doctorRecord = user.role === "doctor"
    ? (await db.select().from(doctors).where(eq(doctors.userId, user.id)))[0]
    : undefined;

  const token = signToken({
    userId: user.id,
    supabaseId: authData.user.id,
    email: user.email,
    role: user.role,
    patientId: patientRecord?.id,
    doctorId: doctorRecord?.id,
  });

  return res.json({
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, avatarUrl: user.avatarUrl },
    patientId: patientRecord?.id ?? null,
    doctorId: doctorRecord?.id ?? null,
  });
});

// POST /api/auth/logout
router.post("/logout", requireAuth, async (req: Request, res: Response) => {
  if (req.user?.supabaseId) {
    await supabase.auth.admin.signOut(req.user.supabaseId);
  }
  return res.json({ message: "Logged out" });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  let profile: any = null;
  if (user.role === "patient") {
    const [p] = await db.select().from(patients).where(eq(patients.userId, user.id));
    profile = p;
  } else if (user.role === "doctor") {
    const [d] = await db.select().from(doctors).where(eq(doctors.userId, user.id));
    profile = d;
  }

  return res.json({ user, profile });
});

// POST /api/auth/refresh  — exchange Supabase access token for our JWT
router.post("/refresh", async (req: Request, res: Response) => {
  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ error: "access_token required" });

  const { data: { user: sbUser }, error } = await supabase.auth.getUser(access_token);
  if (error || !sbUser) return res.status(401).json({ error: "Invalid token" });

  const [user] = await db.select().from(users).where(eq(users.supabaseId, sbUser.id));
  if (!user) return res.status(404).json({ error: "User not found" });

  const patientRecord = user.role === "patient"
    ? (await db.select().from(patients).where(eq(patients.userId, user.id)))[0]
    : undefined;
  const doctorRecord = user.role === "doctor"
    ? (await db.select().from(doctors).where(eq(doctors.userId, user.id)))[0]
    : undefined;

  const token = signToken({
    userId: user.id, supabaseId: sbUser.id, email: user.email, role: user.role,
    patientId: patientRecord?.id, doctorId: doctorRecord?.id,
  });
  return res.json({ token });
});

export default router;
