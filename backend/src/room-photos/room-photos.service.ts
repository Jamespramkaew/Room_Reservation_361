import { Injectable } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { PrismaRepository } from "src/prisma/prisma.repository";
import { RoomPhotosRepository } from "./room-photos.repository";
import { RoomPhotos } from "../generated/prisma/client";
import { S3UploadResultDto } from "./room-photo.dto";
import { S3Service } from "src/s3/s3.service";


@Injectable()
export class RoomPhotosService {
    constructor(
        private readonly prismaRepo: PrismaRepository,
        private readonly roomPhotosRepo: RoomPhotosRepository,
        private readonly s3Service: S3Service
    ) { }

    async getRoomPhotosByRoomId(roomId: string): Promise<any[]> {
        const room = await this.prismaRepo.findById('room', roomId)
        if (!room) throw new NotFoundException("Room not found.");

        const roomPhotos = await this.roomPhotosRepo.getRoomPhotosByRoomId(roomId);
        
        // แปลง object_key เป็น image_url และลบ object_key ออก
        return roomPhotos.map(photo => ({
            id: photo.id,
            room_id: photo.room_id,
            image_url: this.s3Service.getObjectUrl(photo.object_key),
            caption: photo.caption,
            sort_order: photo.sort_order,
            created_at: photo.created_at
        }));
    };

    async addRoomPhoto(roomId: string, uploadedResult: S3UploadResultDto, caption?: string) {
        const room = await this.prismaRepo.findById('room', roomId)
        if (!room) throw new NotFoundException("Room not found.");

        let sortOrder;
        const roomPhotos: RoomPhotos[] = await this.roomPhotosRepo.getRoomPhotosByRoomId(roomId);

        if (roomPhotos.length !== 0)
            sortOrder = roomPhotos.length + 1;
        else
            sortOrder = 1;

        const result = await this.roomPhotosRepo.createRoomPhoto({
            roomId,
            objectKey: uploadedResult.key,
            sortOrder,
            caption: caption
        });

        return result;
    };
};



