import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ChangePasswordDto{
    
  @IsString()
  @MinLength(6, { message: 'La contraseña actual debe tener al menos 6 caracteres.' })
  currentPassword: string;

  @IsString()
  @MinLength(4, { message: 'La nueva contraseña debe tener al menos 4 caracteres.' })
  @MaxLength(20, { message: 'La nueva contraseña no puede exceder los 20 caracteres.' })
  @Matches(/^\S+$/, { message: 'La contraseña no debe contener espacios.' })
  newPassword: string;
}