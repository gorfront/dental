import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../lib/jwt";
import { supabase } from "../lib/supabase";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── Extract token ────────────────────────────────────────────────────────
function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

// ─── Require valid JWT ────────────────────────────────────────────────────
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── Require specific role ────────────────────────────────────────────────
export function requireRole(...roles: JwtPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires role: ${roles.join(" or ")}` });
    }
    next();
  };
}

// ─── Verify Supabase session token (from frontend) ───────────────────────
export async function verifySupabaseToken(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Invalid Supabase token" });

  // Look up our user record
  const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id));
  if (!dbUser) return res.status(404).json({ error: "User not found in database" });

  req.user = {
    userId: dbUser.id,
    supabaseId: user.id,
    email: dbUser.email,
    role: dbUser.role,
  };
  next();
}
