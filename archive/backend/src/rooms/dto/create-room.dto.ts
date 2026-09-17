import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { RoomStatus, RoomSize, RoomType } from '../../generated/prisma/client';

export class RoomFacilityInputDto {
  @IsString({ message: 'facilityId must be a string' })
  @IsNotEmpty({ message: 'facilityId is required' })
  facilityId: string;

  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  quantity: number;

  @IsOptional()
  @IsInt({ message: 'broken_quantity must be an integer' })
  @Min(0, { message: 'broken_quantity must be at least 0' })
  broken_quantity?: number = 0;

  @IsInt({ message: 'sort_order must be an integer' })
  @Min(1, { message: 'sort_order must be at least 1' })
  sort_order: number;

  @IsOptional()
  @IsString({ message: 'note must be a string' })
  @Transform(({ value }) => value?.trim() ?? null)
  note?: string | null = null;
}

export class CreateRoomDto {
  @IsString({ message: 'room_name must be a string' })
  @IsNotEmpty({ message: 'room_name is required' })
  @Transform(({ value }) => value?.trim())
  room_name: string;

  @IsInt({ message: 'capacity must be an integer' })
  @Min(1, { message: 'capacity must be at least 1' })
  capacity: number;

  @IsEnum(RoomStatus, {
    message: `status must be one of: ${Object.values(RoomStatus).join(', ')}`,
  })
  status: RoomStatus;

  @IsEnum(RoomSize, {
    message: `size must be one of: ${Object.values(RoomSize).join(', ')}`,
  })
  size: RoomSize;

  @IsEnum(RoomType, {
    message: `room_type must be one of: ${Object.values(RoomType).join(', ')}`,
  })
  room_type: RoomType;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @Transform(({ value }) => value?.trim() ?? null)
  description?: string | null = null;

  @IsOptional()
  @IsArray({ message: 'facilities must be an array' })
  @ValidateNested({ each: true })
  @Type(() => RoomFacilityInputDto)
  facilities?: RoomFacilityInputDto[] = [];
}
