import { fileURLToPath } from 'node:url';
import { runMigrations } from '../../shared/db/migrate';
import { getEnv } from '../../shared/env';

// build.mjs copies drizzle/migrations next to the bundled index.mjs
const migrationsFolder = fileURLToPath(new URL('./migrations', import.meta.url));

/** Not behind API Gateway. Run with `aws lambda invoke --function-name roomres-migrate`. */
export const handler = async () => {
  const result = await runMigrations(getEnv().DATABASE_URL, migrationsFolder);
  console.log(JSON.stringify(result));
  return result;
};
