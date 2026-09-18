import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaRepository {
  private readonly logger = new Logger(PrismaRepository.name);

  constructor(private readonly prisma: PrismaService) {}


  async findById<T>(
    model: keyof Omit<PrismaClient, `$${string}` | symbol>,
    id: string,
  ): Promise<T | null> {
    try {
      return await (this.prisma[model] as any).findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`findById error on ${String(model)}:`, error.message);
      throw error;
    }
  }


  async create<T>(
    model: keyof Omit<PrismaClient, `$${string}` | symbol>,
    data: any,
  ): Promise<T> {
    try {
      return await (this.prisma[model] as any).create({ data });
    } catch (error) {
      this.logger.error(`create error on ${String(model)}:`, error.message);
      throw error;
    }
  }


  async update<T>(
    model: keyof Omit<PrismaClient, `$${string}` | symbol>,
    id: string,
    data: any,
  ): Promise<T> {
    try {
      return await (this.prisma[model] as any).update({
        where: { id },
        data,
      });
    } catch (error) {
      this.logger.error(`update error on ${String(model)}:`, error.message);
      throw error;
    }
  }


  async delete<T>(
    model: keyof Omit<PrismaClient, `$${string}` | symbol>,
    id: string,
  ): Promise<T> {
    try {
      return await (this.prisma[model] as any).delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`delete error on ${String(model)}:`, error.message);
      throw error;
    }
  }


  async softDelete<T>(
    model: keyof Omit<PrismaClient, `$${string}` | symbol>,
    id: string,
  ): Promise<T> {
    try {
      return await (this.prisma[model] as any).update({
        where: { id },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      this.logger.error(`softDelete error on ${String(model)}:`, error.message);
      throw error;
    }
  }


  async exists(
    model: keyof Omit<PrismaClient, `$${string}` | symbol>,
    id: string,
  ): Promise<boolean> {
    try {
      const record = await (this.prisma[model] as any).findUnique({
        where: { id },
        select: { id: true },
      });
      return record !== null;
    } catch (error) {
      this.logger.error(`exists error on ${String(model)}:`, error.message);
      throw error;
    }
  }

  getPrisma() {
    return this.prisma;
  }
}
