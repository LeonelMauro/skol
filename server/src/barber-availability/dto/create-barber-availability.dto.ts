import { IsBoolean, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { DayOfWeek } from "../day-of-week.enum";

export class CreateBarberAvailabilityDto { 
    @IsNotEmpty()
    @IsNumber()
    barberId: number;   // Peluquero asignado
    
    @IsEnum(DayOfWeek)
    day_of_week: string;

    
    @IsNotEmpty()
    @IsString()
    start_time: string; // "09:00"
    
    @IsNotEmpty()
    @IsString()
    end_time: string;   // "13:00"   

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
