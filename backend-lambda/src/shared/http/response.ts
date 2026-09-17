// Same envelope as the NestJS backend (backend/src/common/utils/response.util.ts),
// so the frontend can switch APIs without changing how it reads responses.

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | string[];
  data: T;
  pagination?: Pagination;
}

export const successResponse = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const paginatedResponse = <T>(
  data: T,
  { page, limit, total }: Omit<Pagination, 'total_pages'>,
  message = 'Success',
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
});

export const errorResponse = (message: string | string[]): ApiResponse<null> => ({
  success: false,
  message,
  data: null,
});
