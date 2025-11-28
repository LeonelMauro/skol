import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateReservationDto {
  
  @IsNotEmpty()
  @IsNumber()
  clientId: number;   // Cliente que reserva
  
  @IsNotEmpty()
  @IsNumber()
  barberId: number;   // Peluquero asignado

  @IsNotEmpty()
  @IsNumber()
  serviceId: number;  // Servicio elegido

  @IsNotEmpty()
  @IsString()
  date: string;       // yyyy-mm-dd

  @IsNotEmpty()
  @IsString()
  time: string;       // hh:mm
}
