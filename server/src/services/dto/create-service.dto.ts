import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateServiceDto {
    
    @IsString()
    @IsNotEmpty()
    name:string;
        
    @IsString()
    @IsNotEmpty()
    description:string;
    
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    price:number;
    
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    duration_minutes:number;
        
}
