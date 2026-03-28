import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Detect whether SSL is needed from the DATABASE_URL.
// Neon, Supabase, Railway etc. all include sslmode=require in their URLs.
// Local Postgres usually does not — forcing SSL on local crashes with
// "The server does not support SSL connections".
function sslConfig() {
  const url = process.env.DATABASE_URL ?? "";
  const needsSsl =
    url.includes("sslmode=require") ||
    url.includes("neon.tech") ||
    url.includes("supabase.com") ||
    url.includes("railway.app") ||
    url.includes("render.com") ||
    process.env.NODE_ENV === "production";

  if (!needsSsl) return undefined; // no SSL — plain local connection
  return { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: sslConfig(),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === "development" });
export { pool };
