import {Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus} from '@nestjs/common';
import { RoomPhotosService } from './room-photos.service';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { successResponse } from 'src/common/utils/response.util';

@Controller('room/:roomId/images')
export class RoomPhotosController{
    constructor(private readonly service: RoomPhotosService){}

    @Get()
    async getRoomPhotosByRoomId(@Param('roomId') roomId: string): Promise<ApiResponse<any[]>>{
        const data = await this.service.getRoomPhotosByRoomId(roomId);
        return successResponse(data,"Room photos fetched successfully");
    }


}