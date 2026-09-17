import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { RoomStatus, RoomSize, RoomType } from '../../generated/prisma/client';
import { RoomFacilityInputDto } from './create-room.dto';

export class UpdateRoomDto {
  @IsOptional()
  @IsString({ message: 'room_name must be a string' })
  @Transform(({ value }) => value?.trim())
  room_name?: string;

  @IsOptional()
  @IsInt({ message: 'capacity must be an integer' })
  @Min(1, { message: 'capacity must be at least 1' })
  capacity?: number;

  @IsOptional()
  @IsEnum(RoomStatus, {
    message: `status must be one of: ${Object.values(RoomStatus).join(', ')}`,
  })
  status?: RoomStatus;

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

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @Transform(({ value }) => value?.trim() ?? null)
  description?: string | null;

  @IsOptional()
  @IsArray({ message: 'facilities must be an array' })
  @ValidateNested({ each: true })
  @Type(() => RoomFacilityInputDto)
  facilities?: RoomFacilityInputDto[];
}
