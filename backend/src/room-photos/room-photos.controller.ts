import { Controller, Get, Post, Body, Param, UploadedFile, UseInterceptors, HttpCode, HttpStatus, BadRequestException, Patch, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { successResponse } from 'src/common/utils/response.util';
import { RoomPhotosService } from './room-photos.service';
import { S3Service } from 'src/s3/s3.service';
import { AddRoomPhotoRequestDto, UpdateRoomPhotoRequestDto } from './room-photo.dto';

@Controller('rooms/:roomId/images')
export class RoomPhotosController {
    constructor(
        private readonly service: RoomPhotosService,
        private readonly s3Service: S3Service
    ) { }

    @Get()
    async getRoomPhotosByRoomId(@Param('roomId') roomId: string): Promise<ApiResponse<any[]>> {
        const data = await this.service.getRoomPhotosByRoomId(roomId);
        return successResponse(data, "Room photos fetched successfully");
    };

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    async addRoomPhoto(
        @Param('roomId') roomId: string,
        @Body() body: AddRoomPhotoRequestDto,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<ApiResponse<any>> {

        if (!file) {
            throw new BadRequestException('Room photo is require');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type. Only images are allowed (jpeg, png, gif, webp)`
            );
        }

        const maxFileSize = 25 * 1024 * 1024;
        if (file.size > maxFileSize) {
            throw new BadRequestException('File size exceeds 25MB limit');
        }

        const key = `rooms/${roomId}/${Date.now()}-${file.originalname}`;
        try {
            const uploadedResult = await this.s3Service.uploadFile(file, key);
            const data = await this.service.addRoomPhoto(roomId, uploadedResult, body.caption);
            return successResponse(data, "Room photo uploaded successfully");
        }
        catch (error: any) {
            await this.s3Service.deleteFile(key);
            throw error;
        };
    };

    @Patch(':roomPhotoId')
    async updateRoomPhoto(
        @Param('roomId') roomId: string,
        @Param('roomPhotoId') roomPhotoId: string,
        @Body() body: UpdateRoomPhotoRequestDto
    ) {
        if (!body.caption && !body.sortOrder)
            throw new BadRequestException('At least one field must be provided for update')

        const data = await this.service.updateRoomPhoto(
            roomId,
            roomPhotoId,
            body.sortOrder ? body.sortOrder : undefined,
            body.caption ? body.caption : undefined
        );
        return successResponse(data, "Room photo updated successfully");
    }


    @Delete(':roomPhotoId')
    async deleteRoomPhoto(
        @Param('roomId') roomId: string,
        @Param('roomPhotoId') roomPhotoId: string
    ) {
        const data = await this.service.deleteRoomPhoto(roomId, roomPhotoId);
        return successResponse(data, "Room photo deleted successfully");
    };

};