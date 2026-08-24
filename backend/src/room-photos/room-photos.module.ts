import { Module } from '@nestjs/common';
import { RoomPhotosService } from './room-photos.service';
import { RoomPhotosController } from './room-photos.controller';
import { RoomPhotosRepository } from './room-photos.repository';
import { S3Module } from 'src/s3/s3.module';


@Module({
  imports: [S3Module],
  controllers: [RoomPhotosController],
  providers: [RoomPhotosService, RoomPhotosRepository],
  exports: [RoomPhotosService],
})
export class RoomPhotosModule {}
