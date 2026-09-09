import { Controller, Get, Param } from '@nestjs/common';
import { MockRoomsService } from './mock-rooms.service';
import { MockRoom } from './mock-rooms.data';
import { ApiResponse } from '../common/interfaces/response.interface';
import { successResponse } from '../common/utils/response.util';

@Controller('mock/rooms')
export class MockRoomsController {
  constructor(private readonly mockRoomsService: MockRoomsService) {}

  @Get()
  findAll(): ApiResponse<MockRoom[]> {
    const data = this.mockRoomsService.findAll();
    return successResponse(data, 'Mock rooms fetched successfully');
  }

  @Get(':id')
  findById(@Param('id') id: string): ApiResponse<MockRoom> {
    const data = this.mockRoomsService.findById(id);
    return successResponse(data, 'Mock room fetched successfully');
  }
}
