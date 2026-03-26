import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Явно грузим продакшен env
dotenv.config({ path: '.env.prod' });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in .env.prod');
}

export default defineConfig({
    schema: './src/models/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
});