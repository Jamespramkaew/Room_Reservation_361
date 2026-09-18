import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExampleDto {
  @IsString({ message: 'author must be a string' })
  @IsNotEmpty({ message: 'author cannot be empty' })
  @MinLength(3, { message: 'author must be at least 3 characters' })
  @MaxLength(50, { message: 'author must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  author: string;

  @IsString({ message: 'comment must be a string' })
  @IsNotEmpty({ message: 'comment cannot be empty' })
  @MinLength(5, { message: 'comment must be at least 5 characters' })
  @MaxLength(200, { message: 'comment must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  comment: string;
}
