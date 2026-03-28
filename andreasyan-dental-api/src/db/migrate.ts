import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

function sslConfig() {
  const url = process.env.DATABASE_URL ?? "";
  const needsSsl =
    url.includes("sslmode=require") ||
    url.includes("neon.tech") ||
    url.includes("supabase.com") ||
    url.includes("railway.app") ||
    url.includes("render.com") ||
    process.env.NODE_ENV === "production";
  if (!needsSsl) return undefined;
  return { rejectUnauthorized: false };
}

async function main() {
  console.log("🔄 Running migrations...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: sslConfig(),
  });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  await pool.end();
  console.log("✅ Migrations complete");
}

main().catch((e) => { console.error(e); process.exit(1); });
