import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'La imagen es obligatoria' })
  @IsString()
  imageUrl: string;
}
