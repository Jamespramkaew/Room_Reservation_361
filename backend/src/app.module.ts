import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { ExampleModule } from './example';
import { RoomPhotosModule} from './room-photos';
import { RequestValidationMiddleware } from './common/middlewares';
import { S3Module } from './s3/s3.module';
import { FacilitiesModule } from './facilities/facilities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ExampleModule,
    RoomPhotosModule,
    S3Module,
    FacilitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestValidationMiddleware)
      .exclude(
        { path: 'rooms/:roomId/photos', method: RequestMethod.POST },
        { path: 'rooms/:roomId/photos', method: RequestMethod.PUT }
      )
      .forRoutes('*');
  }
}
