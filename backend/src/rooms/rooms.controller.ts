import { Controller, Get, Query, Param, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RoomService } from './rooms.service';
import { QueryRoomsDto, CreateRoomDto } from './dto';
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRoom(
    @Body() body: CreateRoomDto,
  ): Promise<ApiResponse<RoomDetailResponse>> {
    const data = await this.roomService.createRoom(body);
    return successResponse(data, 'Room created successfully.');
  }
}
