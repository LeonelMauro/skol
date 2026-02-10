import { IsNumber, IsDateString, Matches } from "class-validator";

export class CreateBookingDto {
  @IsNumber()
  barberId: number;

  @IsNumber()
  clientId: number;

  guestName?: string; 

  @IsNumber()
  serviceId: number;

  @IsDateString()
  date: string; // yyyy-mm-dd

  @IsNumber()
  locationId: number; 

  @Matches(/^\d{2}:\d{2}$/, { message: "El formato de hora debe ser HH:MM" })
  time: string;
}
