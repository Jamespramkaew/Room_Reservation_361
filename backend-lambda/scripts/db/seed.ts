import { getDb } from '../../src/shared/db/client';
import { runSeed } from '../../src/shared/db/seed';

await runSeed(getDb());
console.log('Seed complete. Logins: admin/admin123, student1/password123, student2/password123');
process.exit(0);
