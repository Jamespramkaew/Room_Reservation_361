import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Facilities, Prisma } from '../generated/prisma/client';

@Injectable()
export class FacilitiesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Facilities[]> {
        return this.prisma.facilities.findMany({
            where: { deleted_at: null },
            orderBy: { name: 'asc' },
        });
    }

    async findById(id: string): Promise<Facilities | null> {
        return this.prisma.facilities.findUnique({
            where: {id, deleted_at: null },
        });
    }

    async findByName(name: string): Promise<Facilities | null> {
        return this.prisma.facilities.findUnique({
            where: { name, deleted_at: null },
        });
    }

    async create(data: Prisma.FacilitiesCreateInput): Promise<Facilities> {
        return this.prisma.facilities.create({
            data,
        });
    }

    async update(id: string, data: Prisma.FacilitiesUpdateInput): Promise<Facilities> {
        return this.prisma.facilities.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: string): Promise<Facilities> {
        return this.prisma.facilities.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }
}