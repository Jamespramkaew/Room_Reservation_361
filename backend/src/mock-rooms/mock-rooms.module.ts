import { Module } from '@nestjs/common';
import { MockRoomsController } from './mock-rooms.controller';
import { MockRoomsService } from './mock-rooms.service';

@Module({
  controllers: [MockRoomsController],
  providers: [MockRoomsService],
})
export class MockRoomsModule {}
