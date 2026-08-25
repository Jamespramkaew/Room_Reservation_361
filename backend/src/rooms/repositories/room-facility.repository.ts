import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { RoomFacilities } from '../../generated/prisma/client';

export interface RoomFacilityUpsertData {
  quantity: number;
  broken_quantity: number;
  sort_order: number;
  note: string | null;
}

@Injectable()
export class RoomFacilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByRoomId(roomId: string): Promise<RoomFacilities[]> {
    return this.prisma.roomFacilities.findMany({
      where: { room_id: roomId },
      orderBy: { sort_order: 'asc' },
    });
  }

  async upsert(
    roomId: string,
    facilityId: string,
    data: RoomFacilityUpsertData,
  ): Promise<RoomFacilities> {
    return this.prisma.roomFacilities.upsert({
      where: {
        room_id_facility_id: {
          room_id: roomId,
          facility_id: facilityId,
        },
      },
      update: data,
      create: {
        room_id: roomId,
        facility_id: facilityId,
        ...data,
      },
    });
  }

  async deleteByRoomAndFacility(
    roomId: string,
    facilityId: string,
  ): Promise<RoomFacilities> {
    return this.prisma.roomFacilities.delete({
      where: {
        room_id_facility_id: {
          room_id: roomId,
          facility_id: facilityId,
        },
      },
    });
  }
}
