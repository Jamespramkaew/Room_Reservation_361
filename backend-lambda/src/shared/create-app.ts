import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import type { LambdaContext, LambdaEvent } from 'hono/aws-lambda';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { getEnv } from './env';
import { HttpError, isUniqueViolation } from './http/errors';
import { errorResponse } from './http/response';

export type AppEnv = {
  // Present when invoked through Lambda; undefined in the local dev server
  Bindings: { event?: LambdaEvent; lambdaContext?: LambdaContext };
  Variables: { requestId: string };
};

/**
 * Every Lambda function builds its Hono app from here so all of them share
 * CORS, request id, logging and the error envelope.
 */
export function createApp(basePath: `/${string}`) {
  const app = new Hono<AppEnv>().basePath(basePath);

  app.use('*', async (c, next) => {
    const requestId = c.env?.lambdaContext?.awsRequestId ?? randomUUID();
    c.set('requestId', requestId);
    await next();
    c.header('X-Request-Id', requestId);
  });
  app.use('*', logger());
  app.use(
    '*',
    cors({
      origin: (origin) => (getEnv().ALLOWED_ORIGINS.includes(origin) ? origin : null),
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );

  app.notFound((c) => c.json(errorResponse(`Cannot ${c.req.method} ${c.req.path}`), 404));

  app.onError((err, c) => {
    if (err instanceof HttpError) return c.json(errorResponse(err.details), err.status);
    if (err instanceof HTTPException) return c.json(errorResponse(err.message), err.status);
    if (isUniqueViolation(err)) return c.json(errorResponse('Resource already exists'), 409);

    console.error(JSON.stringify({ requestId: c.get('requestId'), error: String(err), stack: err.stack }));
    return c.json(errorResponse('Internal server error'), 500);
  });

  return app;
}
