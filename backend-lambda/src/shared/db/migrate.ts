import { drizzle } from 'drizzle-orm/postgres-js';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

export interface MigrationResult {
  adoptedPrismaDatabase: boolean;
  appliedBefore: number;
  appliedAfter: number;
}

/**
 * Runs Drizzle migrations. A database that was created by the old Prisma migrations
 * already has the baseline schema, so the baseline is recorded as applied instead of re-run.
 */
export async function runMigrations(databaseUrl: string, migrationsFolder: string): Promise<MigrationResult> {
  const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });
  try {
    const adoptedPrismaDatabase = await adoptPrismaBaseline(sql, migrationsFolder);
    const appliedBefore = await countApplied(sql);
    await migrate(drizzle(sql), { migrationsFolder });
    return { adoptedPrismaDatabase, appliedBefore, appliedAfter: await countApplied(sql) };
  } finally {
    await sql.end();
  }
}

async function adoptPrismaBaseline(sql: postgres.Sql, migrationsFolder: string): Promise<boolean> {
  const [{ prisma, drizzleTable }] = await sql<{ prisma: string | null; drizzleTable: string | null }[]>`
    SELECT to_regclass('public._prisma_migrations')::text AS prisma,
           to_regclass('drizzle.__drizzle_migrations')::text AS "drizzleTable"`;
  if (!prisma || drizzleTable) return false;

  const [baseline] = readMigrationFiles({ migrationsFolder });
  await sql.begin(async (tx) => {
    await tx`CREATE SCHEMA IF NOT EXISTS drizzle`;
    await tx`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)`;
    await tx`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${baseline.hash}, ${baseline.folderMillis})`;
  });
  return true;
}

async function countApplied(sql: postgres.Sql): Promise<number> {
  const [{ exists }] = await sql<{ exists: string | null }[]>`
    SELECT to_regclass('drizzle.__drizzle_migrations')::text AS exists`;
  if (!exists) return 0;
  const [{ count }] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations`;
  return count;
}
