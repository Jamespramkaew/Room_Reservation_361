import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomService } from './rooms.service';
import { RoomRepository } from './rooms.repository';
import { FacilityRepository } from './repositories/facility.repository';
import { RoomFacilityRepository } from './repositories/room-facility.repository';

@Module({
  controllers: [RoomsController],
  providers: [
    RoomService,
    RoomRepository,
    FacilityRepository,
    RoomFacilityRepository,
  ],
  exports: [RoomService],
})
export class RoomsModule {}
