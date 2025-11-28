import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  // Crear usuario (solo admin)
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Obtener todos los usuarios — solo admin
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Obtener un usuario por ID — admin y barber
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'barber')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // Editar usuario — admin
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  // Cambiar contraseña — cualquier usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto){
    return this.userService.changePassword(+id, dto);
  }

  // Eliminar usuario — solo admin
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
