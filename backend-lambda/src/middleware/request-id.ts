import type { MiddlewareHandler } from 'hono';
import { randomUUID } from 'crypto';

/**
 * Request ID Middleware
 * เพิ่ม unique request ID ให้ทุก request เพื่อ tracking ใน logs
 */
export const requestId = (): MiddlewareHandler => {
  return async (c, next) => {
    const id = c.req.header('X-Request-Id') || randomUUID();
    c.set('requestId', id);
    c.header('X-Request-Id', id);
    await next();
  };
};
