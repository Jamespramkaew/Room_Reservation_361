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

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  async findAll() {
    return this.exampleService.findAll();
  }

  @Get('count')
  async getCount() {
    return this.exampleService.getCount();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.exampleService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateExampleDto) {
    return this.exampleService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExampleDto) {
    return this.exampleService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.exampleService.delete(id);
  }
}
