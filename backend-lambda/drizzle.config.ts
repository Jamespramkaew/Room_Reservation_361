import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/db/schema.ts',       // ← ที่เก็บ table schema
  out: './drizzle/migrations',        // ← ที่เก็บ migration files
  dialect: 'postgresql',              // ← ใช้ PostgreSQL
  dbCredentials: {
    url: process.env.DATABASE_URL!,   // ← อ่าน connection string จาก .env
  },
  verbose: true,
  strict: true,
});
