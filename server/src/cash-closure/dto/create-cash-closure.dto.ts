import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCashClosureDto {

    
    @IsNumber()
    @IsNotEmpty()
    locationId: number;
    
    @IsNotEmpty()
    @IsString()
    date: string;
         
}
