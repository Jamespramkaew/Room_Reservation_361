import { sql } from 'drizzle-orm';
import { createApp } from '../../shared/create-app';
import { getDb } from '../../shared/db/client';
import { errorResponse, successResponse } from '../../shared/http/response';

export const app = createApp('/api/health');

app.get('/', async (c) => {
  try {
    await getDb().execute(sql`SELECT 1`);
    return c.json(successResponse({ status: 'ok', database: 'up' }));
  } catch (err) {
    console.error('health check: database unreachable', err);
    return c.json(errorResponse('Database unreachable'), 503);
  }
});
