import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  
  use(req: Request, res: Response, next: NextFunction): void {
    // ตรวจสอบว่า Content-Type เป็น JSON
    const contentType = req.get('content-type');
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      if (!contentType || !contentType.includes('application/json')) {
        throw new BadRequestException(
          'Content-Type must be application/json'
        );
      }
    }

    // ตรวจสอบว่า body มีข้อมูล
    if ((req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') && !req.body) {
      throw new BadRequestException();
    }

    next();
  }
}