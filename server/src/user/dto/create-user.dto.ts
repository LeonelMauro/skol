import { Type } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
        @IsString()
        @IsNotEmpty()
        name: string;

        @IsNotEmpty()
        @IsString()
        email: string;

        @IsNotEmpty()
        @IsString()
        @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres.' })
        @Matches(/^\S+$/, { message: 'La contraseña no debe contener espacios.' })
        password: string;

        @IsNotEmpty()
        @IsDateString()
        birthDate: string; // Ej: "1998-05-10"

        @IsNotEmpty()
        @Type(() => Number)
        @IsNumber()
        roleId: number;
}
