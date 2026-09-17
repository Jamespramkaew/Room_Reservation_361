import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getEnv } from '../env';
import * as relations from './relations';
import * as tables from './schema';

export const schema = { ...tables, ...relations };

const createDb = (sql: postgres.Sql) => drizzle(sql, { schema });

export type Db = ReturnType<typeof createDb>;

let db: Db | undefined;

/**
 * One connection per Lambda container, created outside the handler so warm
 * invocations reuse it. Use `?sslmode=require` in DATABASE_URL for RDS.
 */
export function getDb(): Db {
  if (!db) {
    const sql = postgres(getEnv().DATABASE_URL, { max: 1, idle_timeout: 20, connect_timeout: 10 });
    db = createDb(sql);
  }
  return db;
}
