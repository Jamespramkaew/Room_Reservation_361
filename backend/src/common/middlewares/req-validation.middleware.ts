import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // ข้ามการตรวจสอบสำหรับ GET และ DELETE
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }

    const contentType = req.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new BadRequestException(
        'Content-Type header must be application/json'
      );
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new BadRequestException(
        'Request body cannot be empty for POST, PUT, PATCH requests'
      );
    }

    next();
  }
}