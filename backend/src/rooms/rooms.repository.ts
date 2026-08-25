import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Room, RoomStatus, RoomSize, Prisma } from '../generated/prisma/client';

export interface RoomFindManyArgs {
  search?: string;
  status?: RoomStatus;
  size?: RoomSize;
  capacity?: number;
  facilities?: string[];
  skip?: number;
  take?: number;
}

@Injectable()
export class RoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(args: RoomFindManyArgs): Promise<Room[]> {
    const where = this.buildWhereClause(args);

    return this.prisma.room.findMany({
      where,
      select: {
        id: true,
        room_name: true,
        description: true,
        seat_capacity: true,
        status: true,
        size: true,
        deleted_at: true,
        created_at: true,
        updated_at: true,
        room_facilities: {
          select: {
            facility: {
              select: {
                name: true,
              },
            },
          },
        },
        room_photos: {
          select: {
            object_key: true,
            sort_order: true,
            caption: true,
          },
          orderBy: {
            sort_order: 'asc',
          },
        },
      },
      skip: args.skip,
      take: args.take,
      orderBy: {
        room_name: 'asc',
      },
    });
  }

  async count(args: RoomFindManyArgs): Promise<number> {
    const where = this.buildWhereClause(args);

    return this.prisma.room.count({ where });
  }

  async create(data: {
    room_name: string;
    seat_capacity: number;
    status: import('../generated/prisma/client').RoomStatus;
    size: import('../generated/prisma/client').RoomSize;
    description: string | null;
  }): Promise<Room> {
    return this.prisma.room.create({ data });
  }

  async update(
    roomId: string,
    data: {
      room_name?: string;
      seat_capacity?: number;
      status?: import('../generated/prisma/client').RoomStatus;
      size?: import('../generated/prisma/client').RoomSize;
      description?: string | null;
    },
  ): Promise<Room> {
    return this.prisma.room.update({
      where: { id: roomId },
      data,
    });
  }

  async softDelete(roomId: string): Promise<Room> {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { deleted_at: new Date() },
    });
  }

  async hasActiveBookings(roomId: string): Promise<boolean> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { status: true },
    });
    return room?.status === 'RESERVED';
  }

  async findByName(name: string, excludeId?: string): Promise<Room | null> {
    return this.prisma.room.findFirst({
      where: {
        room_name: name,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  async findDetailById(roomId: string): Promise<Room | null> {
    return this.prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        room_name: true,
        description: true,
        seat_capacity: true,
        status: true,
        size: true,
        deleted_at: true,
        created_at: true,
        updated_at: true,
        room_facilities: {
          select: {
            facility_id: true,
            quantity: true,
            broken_quantity: true,
            sort_order: true,
            note: true,
            facility: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            sort_order: 'asc',
          },
        },
        room_photos: {
          select: {
            id: true,
            object_key: true,
            sort_order: true,
          },
          orderBy: {
            sort_order: 'asc',
          },
        },
      },
    });
  }

  private buildWhereClause(args: RoomFindManyArgs): Prisma.RoomWhereInput {
    const where: Prisma.RoomWhereInput = {
      deleted_at: null,
    };

    if (args.search) {
      where.room_name = {
        contains: args.search,
        mode: 'insensitive',
      };
    }

    if (args.status) {
      where.status = args.status;
    }

    if (args.size) {
      where.size = args.size;
    }

    if (args.capacity) {
      where.seat_capacity = {
        gte: args.capacity,
      };
    }

    if (args.facilities?.length) {
      where.AND = args.facilities.map((name) => ({
        room_facilities: {
          some: {
            facility: {
              name: { equals: name, mode: 'insensitive' },
            },
          },
        },
      }));
    }

    return where;
  }
}
