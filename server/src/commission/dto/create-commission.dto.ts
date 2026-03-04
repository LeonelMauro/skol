import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";

export class CreateCommissionDto {

    @IsNumber()
    @IsNotEmpty()
    barberId:number

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    percentage: number
}
