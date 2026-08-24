import { Injectable, NotFoundException } from "@nestjs/common";
import { RoomPhotosRepository } from "./room-photos.repository";
import { RoomPhotos } from "../generated/prisma/client";


@Injectable()
export class RoomPhotosService{
    constructor(private readonly repository:RoomPhotosRepository){}

    async getRoomPhotosByRoomId(id: string): Promise<RoomPhotos[]>{
        
        const roomPhotos = await this.repository.findPhotosByRoomID(id);
        if(!roomPhotos) throw new NotFoundException("Room not found");

        return roomPhotos;
    };


}