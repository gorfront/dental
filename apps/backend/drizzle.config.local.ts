import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Явно грузим локальный env
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in .env.local');
}

export default defineConfig({
    schema: './src/models/schema.ts',
    out: './drizzle', // Папка для миграций
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
});