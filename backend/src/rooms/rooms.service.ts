import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { RoomRepository } from './rooms.repository';
import { FacilityRepository } from './repositories/facility.repository';
import { RoomFacilityRepository } from './repositories/room-facility.repository';
import { QueryRoomsDto, CreateRoomDto } from './dto';
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
  status: string;
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
  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly facilityRepo: FacilityRepository,
    private readonly roomFacilityRepo: RoomFacilityRepository,
  ) {}

  async createRoom(dto: CreateRoomDto): Promise<RoomDetailResponse> {
    await this._ensureNameUnique(dto.room_name);

    if (dto.facilities && dto.facilities.length > 0) {
      await this._ensureFacilityExists(
        dto.facilities.map((f) => f.facilityId),
      );

      for (const f of dto.facilities) {
        this._ensureBrokenNotExceedTotal(f.quantity, f.broken_quantity ?? 0);
      }
    }

    const room = await this.roomRepo.create({
      room_name: dto.room_name,
      seat_capacity: dto.capacity,
      status: dto.status,
      size: dto.size,
      description: dto.description ?? null,
    });

    if (dto.facilities && dto.facilities.length > 0) {
      for (const f of dto.facilities) {
        await this.roomFacilityRepo.upsert(room.id, f.facilityId, {
          quantity: f.quantity,
          broken_quantity: f.broken_quantity ?? 0,
          sort_order: f.sort_order,
          note: f.note ?? null,
        });
      }
    }

    const created = await this.roomRepo.findDetailById(room.id);
    return this.mapToDetailResponse(created);
  }

  private async _ensureNameUnique(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.roomRepo.findByName(name, excludeId);
    if (existing) {
      throw new ConflictException(`Room '${name}' already exists.`);
    }
  }

  private async _ensureFacilityExists(facilityIds: string[]): Promise<void> {
    const found = await this.facilityRepo.findManyByIds(facilityIds);
    if (found.length !== facilityIds.length) {
      const foundIds = found.map((f) => f.id);
      const missing = facilityIds.find((id) => !foundIds.includes(id));
      throw new NotFoundException(`Facility '${missing}' not found.`);
    }
  }

  private _ensureBrokenNotExceedTotal(
    quantity: number,
    brokenQuantity: number,
  ): void {
    if (brokenQuantity > quantity) {
      throw new BadRequestException(
        `broken_quantity (${brokenQuantity}) cannot exceed quantity (${quantity}).`,
      );
    }
  }

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
        status: this._deriveFacilityStatus(rf.quantity, rf.broken_quantity ?? 0),
      })),
      roomImages: room.room_photos.map((photo: any) => ({
        id: photo.id,
        image_url: `${process.env.S3_PUBLIC_URL}/${photo.object_key}`,
        is_primary: photo.sort_order === 1,
        display_order: photo.sort_order,
      })),
    };
  }

  private _deriveFacilityStatus(quantity: number, brokenQuantity: number): string {
    if (brokenQuantity === 0) return 'AVAILABLE';
    if (brokenQuantity >= quantity) return 'UNAVAILABLE';
    return 'PARTIALLY_AVAILABLE';
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
        image_url: `${process.env.S3_PUBLIC_URL}/${photo.object_key}`,
        is_primary: photo.sort_order === 1,
        display_order: photo.sort_order,
      })),
    };
  }
}
