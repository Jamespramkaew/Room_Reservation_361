import { ApiResponse } from '../interfaces/response.interface';

export const successResponse = <T>(
  data: T,
  message: string = 'Success'
): ApiResponse<T> => ({
  success: true,
  message,
  data,
});
