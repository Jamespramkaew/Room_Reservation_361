import { runMigrations } from '../../src/shared/db/migrate';
import { getEnv } from '../../src/shared/env';

const result = await runMigrations(getEnv().DATABASE_URL, 'drizzle/migrations');
if (result.adoptedPrismaDatabase) console.log('Existing Prisma database detected: baseline marked as applied.');
console.log(`Migrations applied: ${result.appliedBefore} -> ${result.appliedAfter}`);
