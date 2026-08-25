import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilitiesDto } from './dto/create-facilities.dto';
import { UpdateFacilitiesDto } from './dto/update-facilities.dto';
import { ApiResponse } from '../common/interfaces/response.interface';
import { successResponse } from '../common/utils/response.util';

@Controller('facilities')
export class FacilitiesController {
    constructor(private readonly facilitiesService: FacilitiesService) {}

    @Get()
    async findAll(): Promise<ApiResponse<any[]>> {
        const data = await this.facilitiesService.findAll();
        return successResponse(data, 'Facilities fetched successfully');
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<ApiResponse<any>> {
        const data = await this.facilitiesService.findById(id);
        return successResponse(data, 'Facility fetched successfully');
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateFacilitiesDto): Promise<ApiResponse<any>> {
        const data = await this.facilitiesService.create(dto);
        return successResponse(data, 'Facility created successfully');
    }

    @Patch(':id')
    async update( @Param('id') id: string, @Body() dto: UpdateFacilitiesDto): Promise<ApiResponse<any>> {
        const data = await this.facilitiesService.update(id, dto);
        return successResponse(data, 'Facility updated successfully');
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void> {
        await this.facilitiesService.delete(id);
    }

}