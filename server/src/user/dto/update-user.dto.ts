// update-user.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
  value
  .toLowerCase()
  .replace(/\b\w/g, (char) => char.toUpperCase())
  )
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  
}
