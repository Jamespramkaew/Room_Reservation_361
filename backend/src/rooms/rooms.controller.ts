import { Controller, Get, Query } from '@nestjs/common';
import { RoomService } from './rooms.service';
import { QueryRoomsDto } from './dto';
import { ApiResponse } from '../common/interfaces/response.interface';
import { successResponse } from '../common/utils/response.util';
import { RoomResponse } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getRooms(
    @Query() query: QueryRoomsDto,
  ): Promise<ApiResponse<RoomResponse[]>> {
    const { data, pagination } = await this.roomService.getRoomList(query);
    const response = successResponse(data, 'Rooms fetched successfully.');
    return { ...response, pagination };
  }
}
