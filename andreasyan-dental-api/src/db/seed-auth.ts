/**
 * Creates Supabase Auth users for all seeded DB users and links supabase_id back.
 * Run AFTER seed.ts: npx tsx src/db/seed-auth.ts
 */
import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import { supabase } from "../lib/supabase";
import { eq, isNull } from "drizzle-orm";

const DEMO_PASSWORD = "Demo1234!";

async function seedAuth() {
  console.log("🔐 Creating Supabase Auth users...");

  // Get all DB users that have no supabase_id yet
  const unlinked = await db.select().from(users).where(isNull(users.supabaseId));
  console.log(`  Found ${unlinked.length} users without Supabase Auth accounts`);

  for (const user of unlinked) {
    // Check if already exists in Supabase by email
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find((u) => u.email === user.email);

    let supabaseId: string;

    if (found) {
      supabaseId = found.id;
      console.log(`  ↩ Already exists: ${user.email}`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: user.fullName, role: user.role },
      });

      if (error) {
        console.error(`  ❌ Failed ${user.email}:`, error.message);
        continue;
      }

      supabaseId = data.user.id;
      console.log(`  ✅ Created: ${user.email} (${user.role})`);
    }

    // Link supabase_id in our DB
    await db.update(users).set({ supabaseId }).where(eq(users.id, user.id));
  }

  console.log(`\n✅ Auth seed complete!`);
  console.log(`📋 Demo login password for ALL accounts: ${DEMO_PASSWORD}`);
  console.log(`\nDemo accounts:`);
  console.log(`  Patient:  anna@email.com`);
  console.log(`  Doctor:   armen@andreasyan.dental`);
  console.log(`  Admin:    admin@andreasyan.dental`);
  process.exit(0);
}

seedAuth().catch((e) => { console.error("❌ Auth seed failed:", e); process.exit(1); });
