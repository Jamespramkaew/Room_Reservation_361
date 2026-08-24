import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma";
import { RoomPhotos } from "../generated/prisma/client";
import { AddRoomPhotoRepoDto } from "./room-photo.dto";

@Injectable()
export class RoomPhotosRepository {

    constructor(private readonly prisma: PrismaService) { }
   
    async getRoomPhotosByRoomId(roomId: string):Promise<RoomPhotos[]>{
        return this.prisma.roomPhotos.findMany({
            where:{room_id: roomId},
            orderBy:{'sort_order':'asc'},
        });
    };

    async createRoomPhoto(data: AddRoomPhotoRepoDto):Promise<RoomPhotos>{
        return this.prisma.roomPhotos.create({
            data:{
                room_id: data.roomId,
                object_key: data.objectKey,
                sort_order: data.sortOrder,
                caption: data.caption || ''
            },
        });
    };
};