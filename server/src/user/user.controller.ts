import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard) // <- Se aplica a TODAS las rutas
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Perfil del usuario autenticado
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  // Crear usuario — solo admin
  @Roles('admin')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Obtener todos los usuarios — admin y barber
  @Roles('admin', 'barber')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Obtener usuario por ID — admin y barber
  @Roles('admin', 'barber')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // Editar usuario — admin, barber, client
  @Roles('admin', 'barber', 'client')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  // Cambiar contraseña — cualquier usuario logueado
  @Patch(':id/password')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(+id, dto);
  }

  // Eliminar usuario — solo admin
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
