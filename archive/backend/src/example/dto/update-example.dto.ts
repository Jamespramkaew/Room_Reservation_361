import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateExampleDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  author?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  comment?: string;
}
