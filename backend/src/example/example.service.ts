import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ExampleRepository } from './example.repository';
import { CreateExampleDto, UpdateExampleDto } from './dto';
import { Example } from '../generated/prisma/client';

@Injectable()
export class ExampleService {
  constructor(private readonly repository: ExampleRepository) {}

  async findAll(): Promise<Example[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Example> {
    const example = await this.repository.findById(id);

    if (!example) {
      throw new NotFoundException(`Example with ID "${id}" not found`);
    }

    return example;
  }

  async create(dto: CreateExampleDto): Promise<Example> {
    // ตรวจสอบว่า author ซ้ำหรือไม่
    const existing = await this.repository.findByAuthor(dto.author);

    if (existing) {
      throw new ConflictException(
        `Author "${dto.author}" already exists. Author must be unique.`,
      );
    }

    return this.repository.create({
      author: dto.author,
      comment: dto.comment,
    });
  }

  async update(id: string, dto: UpdateExampleDto): Promise<Example> {
    // ตรวจสอบว่า record มีอยู่จริงหรือไม่
    await this.findById(id);

    // ถ้าเปลี่ยน author ต้องตรวจสอบว่าไม่ซ้ำกับคนอื่น
    if (dto.author) {
      const existing = await this.repository.findByAuthor(dto.author);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Author "${dto.author}" already exists. Author must be unique.`,
        );
      }
    }

    return this.repository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    // ตรวจสอบว่า record มีอยู่จริงหรือไม่
    await this.findById(id);

    await this.repository.delete(id);
  }

  async getCount(): Promise<{ count: number }> {
    const count = await this.repository.count();
    return { count };
  }
}
