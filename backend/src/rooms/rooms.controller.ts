import { Controller, Get, Query, Param } from '@nestjs/common';
import { RoomService } from './rooms.service';
import { QueryRoomsDto } from './dto';
import { ApiResponse } from '../common/interfaces/response.interface';
import { successResponse } from '../common/utils/response.util';
import { RoomResponse, RoomDetailResponse } from './rooms.service';

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

  @Get(':roomId')
  async getRoomById(
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<RoomDetailResponse>> {
    const data = await this.roomService.getRoomDetail(roomId);
    return successResponse(data, 'Room fetched successfully.');
  }
}
