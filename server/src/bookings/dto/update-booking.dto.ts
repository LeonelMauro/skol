import { IsOptional, IsString, IsNumber, IsEnum } from "class-validator";
import { ReservationStatus } from "src/reservation/entities/reservation.entity";

export class UpdateBookingDto {

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
