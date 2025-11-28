import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';
import { ReservationStatus } from '../entities/reservation.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
