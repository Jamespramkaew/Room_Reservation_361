import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { compress } from 'hono/compress';
import { timeout } from 'hono/timeout';
import { serve } from '@hono/node-server';
import * as dotenv from 'dotenv';

// Import middleware
import { requestId } from './middleware/request-id';
import { validateJSON, limitRequestSize } from './middleware/validation';

// Import routes
import exampleRoutes from './features/example/example.routes';

dotenv.config();

// สร้าง Hono app
const app = new Hono();

// Global Middleware (ลำดับสำคัญ!)
// 1. Request ID - ต้องมาก่อนเสมอ
app.use('*', requestId());

// 2. Request size limit - ป้องกัน payload ใหญ่เกินไป
app.use('*', limitRequestSize(5)); // 5MB limit

// 3. CORS
app.use('*', cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// 4. Compress responses (ลด payload size)
app.use('*', compress());

// 5. Request timeout (Lambda timeout ควรเป็น 29s, set นี้ไว้ 28s เผื่อ)
app.use('*', timeout(28000));

// 6. Logger (ใน production จะไปที่ CloudWatch)
app.use('*', logger());

// 7. Pretty JSON (เฉพาะ dev)
if (process.env.NODE_ENV !== 'production') {
  app.use('*', prettyJSON());
}

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Room Reservation API', 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0',
  });
});

// Health check for load balancer
app.get('/health', (c) => {
  return c.json({ status: 'healthy' }, 200);
});

// API Routes
app.route('/api/example', exampleRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ 
    success: false, 
    message: 'Route not found' 
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Global error:', {
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    path: c.req.path,
    method: c.req.method,
  });
  
  return c.json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  }, 500);
});

// Export app for Lambda
export default app;

// Start server for local development
if (process.env.NODE_ENV !== 'production') {
  const port = parseInt(process.env.PORT || '3000');
  
  console.log('🚀 Starting development server...');
  console.log(`📍 Server: http://localhost:${port}`);
  console.log(`📍 Health: http://localhost:${port}/`);
  
  serve({
    fetch: app.fetch,
    port,
  });
}
