import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma";
import { RoomPhotos, Prisma } from "../generated/prisma/client";

@Injectable()
export class RoomPhotosRepository {

    constructor(private readonly prisma: PrismaService) { }

    async findPhotosByRoomID(id: string): Promise<RoomPhotos[]> {
        return this.prisma.roomPhotos.findMany({
            where: { room_id: id }
        });
    };
    
};