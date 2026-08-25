import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomRepository } from './rooms.repository';
import { QueryRoomsDto } from './dto';
import { Pagination } from '../common/interfaces/response.interface';

export interface RoomImageResponse {
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface RoomImageDetailResponse {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface RoomFacilityResponse {
  facilityId: string;
  name: string;
  quantity: number;
  broken_quantity: number;
  sort_order: number;
  note: string | null;
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

export interface RoomDetailResponse {
  id: string;
  room_name: string;
  capacity: number;
  status: string;
  size: string;
  is_active: boolean;
  description: string | null;
  facilities: RoomFacilityResponse[];
  roomImages: RoomImageDetailResponse[];
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
        size: filters.size,
        capacity: filters.capacity,
        facilities: filters.facilities,
        skip,
        take: limit,
      }),
      this.roomRepo.count({
        search: filters.search,
        status: filters.status,
        size: filters.size,
        capacity: filters.capacity,
        facilities: filters.facilities,
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

  async getRoomDetail(roomId: string): Promise<RoomDetailResponse> {
    const room = await this.roomRepo.findDetailById(roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.mapToDetailResponse(room);
  }

  private mapToDetailResponse(room: any): RoomDetailResponse {
    return {
      id: room.id,
      room_name: room.room_name,
      capacity: room.seat_capacity,
      status: room.status,
      size: room.size,
      is_active: room.deleted_at === null,
      description: room.description ?? null,
      facilities: room.room_facilities.map((rf: any) => ({
        facilityId: rf.facility_id,
        name: rf.facility.name.toUpperCase(),
        quantity: rf.quantity,
        broken_quantity: rf.broken_quantity ?? 0,
        sort_order: rf.sort_order,
        note: rf.note ?? null,
      })),
      roomImages: room.room_photos.map((photo: any) => ({
        id: photo.id,
        image_url: photo.object_key,
        is_primary: photo.sort_order === 1,
        display_order: photo.sort_order,
      })),
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
