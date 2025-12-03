import { IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateBarberAvailabilityDto { 
    @IsNotEmpty()
    @IsNumber()
    barberId: number;   // Peluquero asignado
    
    @IsIn(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'])
    day_of_week: string;

    
    @IsNotEmpty()
    @IsString()
    start_time: string; // "09:00"
    
    @IsNotEmpty()
    @IsString()
    end_time: string;   // "13:00"   
}
