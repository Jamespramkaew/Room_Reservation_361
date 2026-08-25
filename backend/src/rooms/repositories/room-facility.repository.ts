import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { RoomFacilities, PrismaClient } from '../../generated/prisma/client';

type PrismaTx = Omit<PrismaClient, `$${string}`>;

export interface RoomFacilityUpsertData {
  quantity: number;
  broken_quantity: number;
  sort_order: number;
  note: string | null;
}

@Injectable()
export class RoomFacilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByRoomId(roomId: string, tx?: PrismaTx): Promise<RoomFacilities[]> {
    const client = tx ?? this.prisma;
    return client.roomFacilities.findMany({
      where: { room_id: roomId },
      orderBy: { sort_order: 'asc' },
    });
  }

  async upsert(
    roomId: string,
    facilityId: string,
    data: RoomFacilityUpsertData,
    tx?: PrismaTx,
  ): Promise<RoomFacilities> {
    const client = tx ?? this.prisma;
    return client.roomFacilities.upsert({
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
    tx?: PrismaTx,
  ): Promise<RoomFacilities> {
    const client = tx ?? this.prisma;
    return client.roomFacilities.delete({
      where: {
        room_id_facility_id: {
          room_id: roomId,
          facility_id: facilityId,
        },
      },
    });
  }
}
