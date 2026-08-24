import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilitiesDto, UpdateFacilitiesDto } from './dto/create-facilities.dto';
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


}