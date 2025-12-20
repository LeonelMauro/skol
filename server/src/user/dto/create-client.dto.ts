import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()),
  )
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres.' })
  @Matches(/^\S+$/, {
    message: 'La contraseña no debe contener espacios.',
  })
  password: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: string;
}
