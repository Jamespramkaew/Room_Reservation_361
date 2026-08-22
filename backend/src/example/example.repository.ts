import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Example, Prisma } from '../generated/prisma/client';

@Injectable()
export class ExampleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Example[]> {
    return this.prisma.example.findMany({
      orderBy: { author: 'asc' },
    });
  }

  async findById(id: string): Promise<Example | null> {
    return this.prisma.example.findUnique({
      where: { id },
    });
  }

  async findByAuthor(author: string): Promise<Example | null> {
    return this.prisma.example.findUnique({
      where: { author },
    });
  }

  async create(data: Prisma.ExampleCreateInput): Promise<Example> {
    return this.prisma.example.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ExampleUpdateInput): Promise<Example> {
    return this.prisma.example.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Example> {
    return this.prisma.example.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return this.prisma.example.count();
  }
}
