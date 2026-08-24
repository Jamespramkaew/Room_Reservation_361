import { Module } from '@nestjs/common';
import { RoomPhotosService } from './room-photos.service';
import { RoomPhotosController } from './room-photos.controller';
import { RoomPhotosRepository } from './room-photos.repository';


@Module({
  controllers: [RoomPhotosController],
  providers: [RoomPhotosService, RoomPhotosRepository],
  exports: [RoomPhotosService],
})
export class RoomPhotosModule {}
