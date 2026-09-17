/**
 * Application Constants
 */

export const APP_CONFIG = {
  // API
  API_VERSION: process.env.API_VERSION || '1.0.0',
  PORT: parseInt(process.env.PORT || '3000'),
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
  
  // Timeouts (milliseconds)
  REQUEST_TIMEOUT: 28000, // 28 seconds (Lambda timeout - 1s)
  DB_QUERY_TIMEOUT: 10000, // 10 seconds
  
  // Limits
  MAX_REQUEST_SIZE_MB: 5,
  MAX_UPLOAD_SIZE_MB: 10,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const AWS_CONFIG = {
  REGION: process.env.AWS_REGION || 'ap-southeast-1',
  S3_BUCKET: process.env.AWS_S3_BUCKET || '',
  ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
} as const;

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
} as const;

export const CORS_CONFIG = {
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
