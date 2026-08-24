import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Room, RoomStatus, Prisma } from '../generated/prisma/client';

export interface RoomFindManyArgs {
  search?: string;
  status?: RoomStatus;
  capacity?: number;
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
      include: {
        room_facilities: {
          include: {
            facility: true,
          },
        },
        room_photos: {
          orderBy: {
            sort_order: 'asc',
          },
        },
      },
    });
  }

  private buildWhereClause(
    args: RoomFindManyArgs,
  ): Prisma.RoomWhereInput {
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

    if (args.capacity) {
      where.seat_capacity = {
        gte: args.capacity,
      };
    }

    return where;
  }
}
