import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile('.env');
  } catch {
    // no .env file; DATABASE_URL must come from the shell
  }
}

export default defineConfig({
  schema: './src/shared/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  verbose: true,
  strict: true,
});
