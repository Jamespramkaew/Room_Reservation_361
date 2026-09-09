import { Injectable, NotFoundException } from '@nestjs/common';
import { mockRooms, MockRoom } from './mock-rooms.data';

@Injectable()
export class MockRoomsService {
  findAll(): MockRoom[] {
    return mockRooms;
  }

  findById(id: string): MockRoom {
    const room = mockRooms.find((r) => r.id === id);

    if (!room) {
      throw new NotFoundException(`Room with ID "${id}" not found`);
    }
    return room;
  }
}
