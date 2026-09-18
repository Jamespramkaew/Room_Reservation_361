import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFacilitiesDto {
    @IsString({ message: 'name must be a string' })
    @IsNotEmpty({ message: 'name cannot be empty' })
    @MinLength(2, { message: 'name must be at least 2 characters' })
    @MaxLength(100, { message: 'name cannot exceed 100 characters' })
    @Transform(({ value }) => value?.trim())
    name: string;
}