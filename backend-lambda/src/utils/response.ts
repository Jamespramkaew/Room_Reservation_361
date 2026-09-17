import type { Context } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';

/**
 * Pagination Interface
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Standard API Response Format
 * (ตรงกับ backend NestJS)
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: Pagination;
}

/**
 * Success Response
 * (ตรงกับ successResponse ใน backend/src/common/utils/response.util.ts)
 */
export const successResponse = <T>(
  data: T,
  message: string = 'Success'
): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

/**
 * Success Response with Pagination
 */
export const paginatedResponse = <T>(
  data: T,
  message: string,
  pagination: Pagination
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  pagination,
});

/**
 * Error Response (for Hono context)
 */
export const errorResponse = (
  c: Context,
  message: string,
  statusCode: StatusCode = 500
) => {
  return c.json(
    {
      success: false,
      message,
    },
    statusCode
  );
};
