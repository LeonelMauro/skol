import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateBookingDto {

  @IsOptional()
  @IsNumber()
  clientId?: number;

  @IsOptional()
  @IsString()
  guestName?: string;

  @IsNumber()
  serviceId: number;

  @IsNumber()
  locationId: number;

  @IsOptional()
  @IsNumber()
  barberId?: number;

  @IsDateString()
  date: string;

  @IsString()
  time: string;
}