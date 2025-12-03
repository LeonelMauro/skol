import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('reservation')
@UseGuards(JwtAuthGuard,RolesGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}
  // Crear reserva — client y admin
  @Roles('client','barber','admin')
  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.create(createReservationDto);
  }

  // Obtener todas las reservas — admin y barber
  @Roles('admin', 'barber')
  @Get()
  findAll() {
    return this.reservationService.findAll();
  }

  // Obtener una reserva por ID — admin, barber y client
  @Roles('admin', 'barber','client')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationService.findOne(+id);
  }

  // Actualizar reserva — admin y barber
  @Roles('admin', 'barber')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationService.update(+id, updateReservationDto);
  }

  // Eliminar reserva — solo admin
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationService.remove(+id);
  }
}
