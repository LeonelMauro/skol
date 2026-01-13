import { IsNumber } from "class-validator";

export class UpdateBarberLocationDto {
  @IsNumber()
  locationId: number;
}
