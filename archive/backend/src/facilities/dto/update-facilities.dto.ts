import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateFacilitiesDto {
    @IsString({ message: 'name must be a string' })
    @IsOptional()
    @MinLength(2, { message: 'name must be at least 2 characters' })
    @MaxLength(100, { message: 'name cannot exceed 100 characters' })
    @Transform(({ obj }) => (typeof obj.name === 'string' ? obj.name.trim() : obj.name))
    name?: string;
}