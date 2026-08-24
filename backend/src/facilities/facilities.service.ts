import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { FacilitiesRepository } from './facilities.repository';
  import { Facilities } from '../generated/prisma/client';

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
}
