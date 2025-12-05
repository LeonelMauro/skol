import { IsNumber, IsDateString, Matches } from "class-validator";

export class CreateBookingDto {
  @IsNumber()
  barberId: number;

  @IsNumber()
  clientId: number;

  @IsNumber()
  serviceId: number;

  @IsNumber()
  barberAvailability: number;

  @IsDateString()
  date: string; // yyyy-mm-dd

  @Matches(/^\d{2}:\d{2}$/, { message: "El formato de hora debe ser HH:MM" })
  time: string;
}
