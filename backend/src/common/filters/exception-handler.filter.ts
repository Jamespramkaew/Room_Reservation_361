import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/response.interface';

@Catch() 
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let statusCode = 500;
    let message = 'Internal Server Error';

   
    if (exception.getStatus) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message || exception.message;
    } else {

      message = exception.message || 'Something went wrong';
      console.error('Unexpected error:', exception); // Log for debugging
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      message,
      data: null,
    };

    response.status(statusCode).json(errorResponse);
  }
}
