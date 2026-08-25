import { Controller, Get, Query, Param, Post, Patch, Delete, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RoomService } from './rooms.service';
import { QueryRoomsDto, CreateRoomDto, UpdateRoomDto } from './dto';
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

  @Patch(':roomId')
  async updateRoom(
    @Param('roomId') roomId: string,
    @Body() body: UpdateRoomDto,
  ): Promise<ApiResponse<RoomDetailResponse>> {
    const data = await this.roomService.updateRoom(roomId, body);
    return successResponse(data, 'Room updated successfully.');
  }

  @Delete(':roomId')
  async deleteRoom(
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<{ id: string; deleted_at: Date }>> {
    const data = await this.roomService.deleteRoom(roomId);
    return successResponse(data, 'Room deleted successfully.');
  }
}
