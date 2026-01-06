import { Type } from "class-transformer";
import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ServiceIcon } from "../service-icon.enum";

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

    @IsEnum(ServiceIcon)
    icon: ServiceIcon;
        
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    duration_minutes:number;
        
}
