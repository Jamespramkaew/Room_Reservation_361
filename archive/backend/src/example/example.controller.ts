import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExampleService } from './example.service';
import { CreateExampleDto, UpdateExampleDto } from './dto';
import { ApiResponse } from '../common/interfaces/response.interface';
import { successResponse } from '../common/utils/response.util';

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  async findAll(): Promise<ApiResponse<any[]>> {
    const data = await this.exampleService.findAll();
    return successResponse(data, 'Examples fetched successfully');
  }

  @Get('count')
  async getCount(): Promise<ApiResponse<any>> {
    const count = await this.exampleService.getCount();
    return successResponse(count, 'Count fetched successfully');
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApiResponse<any>> {
    const data = await this.exampleService.findById(id);
    return successResponse(data, 'Example fetched successfully');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateExampleDto): Promise<ApiResponse<any>> {
    const data = await this.exampleService.create(dto);
    return successResponse(data, 'Example created successfully');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateExampleDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.exampleService.update(id, dto);
    return successResponse(data, 'Example updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.exampleService.delete(id);
  }
}
