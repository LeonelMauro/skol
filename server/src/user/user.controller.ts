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
import { CreateClientDto } from './dto/create-client.dto';
import { CreateBarberDto } from './dto/create-barber.dto';
import { UpdateBarberLocationDto } from './dto/update-barber-location.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* =======================
     REGISTRO PÚBLICO
     ======================= */
  @Post('register')
  createClient(@Body() dto: CreateClientDto) {
    return this.userService.createClient(dto);
  }

  /* =======================
     RUTAS PROTEGIDAS
     ======================= */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('barbers')
  findAllBarbers() {
    return this.userService.findAllBarbers();
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')   
  @Post('create-barbers')
  createBarber(@Body() dto: CreateBarberDto) {
    return this.userService.createBarber(dto);
  }

  // Perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  // Crear usuario — solo admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Obtener todos los usuarios — admin y barber
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'barber')
  @Get()
  findAll(@Req() req) {
  const q = req.query.q as string;
  return this.userService.findAll(q);
}


  // Obtener usuario por ID — admin y barber
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'barber')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // Editar usuario — admin, barber, client
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'barber', 'client')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  // Cambiar contraseña — cualquier usuario logueado
  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(+id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/location')
  updateBarberLocation(
    @Param('id') id: number,
    @Body() dto: UpdateBarberLocationDto,
  ) {
    return this.userService.updateBarberLocation(id, dto.locationId);
  }


  // Eliminar usuario — solo admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
