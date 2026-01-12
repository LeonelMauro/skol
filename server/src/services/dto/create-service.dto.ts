import { Transform, Type } from "class-transformer";
import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ServiceIcon } from "../service-icon.enum";

export class CreateServiceDto {
    
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) =>
        value
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      )
    name:string;
        
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) =>
    value
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()),
     )
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
