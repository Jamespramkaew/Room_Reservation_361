import type { Context, Next } from 'hono';

/**
 * JSON Body Validator
 * ตรวจสอบว่า request body เป็น JSON ที่ valid
 */
export const validateJSON = async (c: Context, next: Next) => {
  if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
    const contentType = c.req.header('Content-Type');
    
    if (!contentType?.includes('application/json')) {
      return c.json({
        success: false,
        message: 'Content-Type must be application/json',
      }, 400);
    }
    
    try {
      await c.req.json();
    } catch (error) {
      return c.json({
        success: false,
        message: 'Invalid JSON in request body',
      }, 400);
    }
  }
  
  await next();
};

/**
 * Request Size Limiter
 * จำกัด size ของ request body (Lambda มี limit 6MB)
 */
export const limitRequestSize = (maxSizeInMB: number = 5) => {
  const maxBytes = maxSizeInMB * 1024 * 1024;
  
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('Content-Length');
    
    if (contentLength && parseInt(contentLength) > maxBytes) {
      return c.json({
        success: false,
        message: `Request body too large. Maximum size is ${maxSizeInMB}MB`,
      }, 413);
    }
    
    await next();
  };
};
