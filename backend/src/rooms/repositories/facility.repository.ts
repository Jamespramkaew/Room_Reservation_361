import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Facilities } from '../../generated/prisma/client';

@Injectable()
export class FacilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Facilities | null> {
    return this.prisma.facilities.findUnique({
      where: { id },
    });
  }

  async findManyByIds(ids: string[]): Promise<Facilities[]> {
    return this.prisma.facilities.findMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
