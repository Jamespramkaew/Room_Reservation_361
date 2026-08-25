import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
import { FacilitiesRepository } from './facilities.repository';
import { Facilities } from '../generated/prisma/client';
import { CreateFacilitiesDto } from './dto/create-facilities.dto';
import { UpdateFacilitiesDto } from './dto/update-facilities.dto';

@Injectable()
export class FacilitiesService {
    constructor(private readonly repository: FacilitiesRepository) {}

    async findAll(): Promise<Facilities[]> {
        return this.repository.findAll();
    }

    async findById(id: string): Promise<Facilities> {
        const facility = await this.repository.findById(id);

        if (!facility) {
            throw new NotFoundException(`Facility with ID "${id}" not found`);
        }
        return facility;
    }

    async create(dto: CreateFacilitiesDto): Promise<Facilities> {
        const existing = await this.repository.findByName(dto.name);
        
        if (existing) {
            throw new ConflictException(
                `Facility with name "${dto.name}" already exists. Name must be unique.`,
            );
        }

        return this.repository.create({
            name: dto.name
        });
    }

    async update(id: string, dto: UpdateFacilitiesDto): Promise<Facilities> {
        await this.findById(id);
        
        if (dto.name) {
            const existing = await this.repository.findByName(dto.name);
            throw new ConflictException(
                `Facility with name "${dto.name}" already exists. Name must be unique.`,
            );
        }

        return this.repository.update(id, dto);
    }

    async delete(id: string): Promise<Facilities> {
        await this.findById(id);
        return this.repository.softDelete(id);
    }

}
