import { Injectable } from '@nestjs/common';
import { RoomRepository } from './rooms.repository';
import { QueryRoomsDto } from './dto';
import { Pagination } from '../common/interfaces/response.interface';

export interface RoomImageResponse {
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface RoomResponse {
  id: string;
  room_name: string;
  capacity: number;
  status: string;
  size: string;
  facilities: string[];
  is_active: boolean;
  description: string | null;
  roomImages: RoomImageResponse[];
}

export interface RoomListResult {
  data: RoomResponse[];
  pagination: Pagination;
}

@Injectable()
export class RoomService {
  constructor(private readonly roomRepo: RoomRepository) {}

  async getRoomList(filters: QueryRoomsDto): Promise<RoomListResult> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      this.roomRepo.findMany({
        search: filters.search,
        status: filters.status,
        capacity: filters.capacity,
        skip,
        take: limit,
      }),
      this.roomRepo.count({
        search: filters.search,
        status: filters.status,
        capacity: filters.capacity,
      }),
    ]);

    const data = rooms.map((room) => this.mapToResponse(room));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  private mapToResponse(room: any): RoomResponse {
    return {
      id: room.id,
      room_name: room.room_name,
      capacity: room.seat_capacity,
      status: room.status,
      size: room.size,
      is_active: room.deleted_at === null,
      description: room.description ?? null,
      facilities: room.room_facilities.map(
        (rf: any) => rf.facility.name.toUpperCase(),
      ),
      roomImages: room.room_photos.map((photo: any) => ({
        image_url: photo.object_key,
        is_primary: photo.sort_order === 1,
        display_order: photo.sort_order,
      })),
    };
  }
}
