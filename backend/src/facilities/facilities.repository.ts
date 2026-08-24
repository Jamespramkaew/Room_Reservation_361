import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Facilities, Prisma } from '../generated/prisma/client';

@Injectable()
export class FacilitiesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Facilities[]> {
        return this.prisma.facilities.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findById(id: string): Promise<Facilities | null> {
        return this.prisma.facilities.findUnique({
            where: {id},
        });
    }

    async findByName(name: string): Promise<Facilities | null> {
        return this.prisma.facilities.findUnique({
            where: { name },
        });
    }

    async create(data: Prisma.FacilitiesCreateInput): Promise<Facilities> {
        return this.prisma.facilities.create({
            data,
        });
    }
}