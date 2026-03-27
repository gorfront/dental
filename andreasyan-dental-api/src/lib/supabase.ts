import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

// Service role client — full access, backend only
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export const XRAY_BUCKET = "xrays";
export const AVATAR_BUCKET = "avatars";

// Ensure buckets exist
export async function ensureBuckets() {
  const buckets = [
    { name: XRAY_BUCKET, public: false },
    { name: AVATAR_BUCKET, public: true },
  ];
  for (const bucket of buckets) {
    const { data } = await supabase.storage.getBucket(bucket.name);
    if (!data) {
      await supabase.storage.createBucket(bucket.name, { public: bucket.public });
      console.log(`  ✅ Created bucket: ${bucket.name}`);
    }
  }
}
