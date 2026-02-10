import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
} from 'class-validator';
import { ReservationStatus } from 'src/reservation/entities/reservation.entity';

export class CreateDirectBookingDto {

  @IsNumber()
  barberId: number;

  @IsNumber()
  serviceId: number;

  @IsNumber()
  locationId: number;

  @IsDateString()
  date: string;

  @Matches(/^\d{2}:\d{2}$/, {
    message: 'El formato de hora debe ser HH:MM',
  })
  time: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsOptional()
  @IsNotEmpty()
  guestName?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
