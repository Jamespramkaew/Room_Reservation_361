// Drops every table, enum and migration record. Local databases only.
import postgres from 'postgres';
import { getEnv } from '../../src/shared/env';

const { DATABASE_URL, STAGE } = getEnv();
if (STAGE !== 'local') {
  console.error(`Refusing to reset: STAGE is "${STAGE}", expected "local".`);
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1, onnotice: () => {} });
await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
await sql`DROP SCHEMA public CASCADE`;
await sql`CREATE SCHEMA public`;
await sql.end();
console.log('Database reset. Run `npm run db:migrate` next.');
