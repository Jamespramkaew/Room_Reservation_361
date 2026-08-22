import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { RequestValidationMiddleware } from './common/middlewares';
import { HttpExceptionFilter } from './common/filters/exception-handler.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Security Middleware - Helmet
    app.use(helmet());

    // Cookie Parser Middleware
    app.use(cookieParser());

    // CORS Configuration
    app.enableCors({
      origin: configService.get('CORS_ORIGIN') || 'http://localhost:5173',
      credentials: true, // อนุญาตให้ส่ง cookies ข้าม origin
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global Validation Pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // ลบ properties ที่ไม่ได้ define ใน DTO
        forbidNonWhitelisted: false, // ลบเงียบๆ ไม่ throw error
        transform: true, // แปลง type อัตโนมัติ (เช่น string -> number)
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global Prefix (optional - ทุก route จะเริ่มด้วย /api)
    app.setGlobalPrefix('api');

    // Global Exception Filter
    app.useGlobalFilters(new HttpExceptionFilter());



    const port = configService.get('PORT') || 3000;
    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  } catch (error) {
    logger.error('❌ Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
