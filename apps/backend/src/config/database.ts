import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import dotenv from 'dotenv';

// Определяем, в какой мы среде. По умолчанию - local.
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local';

dotenv.config({ path: envFile });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(`DATABASE_URL is missing in ${envFile}`);
}

import * as schema from '../models/schema';

const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });