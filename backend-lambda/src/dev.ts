// Local dev only: serves every HTTP function from functions.json in one Node server
// for a fast edit loop. Real per-function behaviour is tested via `npm run deploy:local`.
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import manifest from '../functions.json';
import { errorResponse } from './shared/http/response';

const root = new Hono();
// On AWS an unknown path never reaches a function (API Gateway answers it); keep the envelope here
root.notFound((c) => c.json(errorResponse(`Cannot ${c.req.method} ${c.req.path}`), 404));

for (const fn of manifest.functions) {
  if (fn.routes.length === 0) continue;
  const { app } = (await import(`./functions/${fn.name}/app.ts`)) as { app: Hono };
  root.route('/', app);
  console.log(`  ${fn.name.padEnd(14)} ${fn.routes.join('  ')}`);
}

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: root.fetch, port }, () => console.log(`\nDev server on http://localhost:${port}`));
