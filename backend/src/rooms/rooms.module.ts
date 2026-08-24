import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomService } from './rooms.service';
import { RoomRepository } from './rooms.repository';

@Module({
  controllers: [RoomsController],
  providers: [RoomService, RoomRepository],
  exports: [RoomService],
})
export class RoomsModule {}
