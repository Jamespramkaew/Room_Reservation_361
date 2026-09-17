import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { RoomStatus, RoomSize, RoomType } from '../../generated/prisma/client';

export class QueryRoomsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit must not exceed 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'search must be a string' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsEnum(RoomStatus, {
    message: `status must be one of: ${Object.values(RoomStatus).join(', ')}`,
  })
  status?: RoomStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'capacity must be an integer' })
  @Min(1, { message: 'capacity must be at least 1' })
  capacity?: number;

  @IsOptional()
  @IsArray({ message: 'facilities must be an array' })
  @IsString({ each: true, message: 'each facility must be a string' })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  facilities?: string[];

  @IsOptional()
  @IsEnum(RoomSize, {
    message: `size must be one of: ${Object.values(RoomSize).join(', ')}`,
  })
  size?: RoomSize;

  @IsOptional()
  @IsEnum(RoomType, {
    message: `room_type must be one of: ${Object.values(RoomType).join(', ')}`,
  })
  room_type?: RoomType;
}
