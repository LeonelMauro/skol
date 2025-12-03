import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BarberAvailabilityService } from './barber-availability.service';
import { CreateBarberAvailabilityDto } from './dto/create-barber-availability.dto';
import { UpdateBarberAvailabilityDto } from './dto/update-barber-availability.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('barber-availability')
@UseGuards(JwtAuthGuard, RolesGuard)

export class BarberAvailabilityController {
  constructor(private readonly barberAvailabilityService: BarberAvailabilityService) {}

  @Roles('admin')
  @Post()
  create(@Body() createBarberAvailabilityDto: CreateBarberAvailabilityDto) {
    return this.barberAvailabilityService.create(createBarberAvailabilityDto);
  }

  @Roles('admin','barber','client')
  @Get()
  findAll() {
    return this.barberAvailabilityService.findAll();
  }
  
  @Roles('admin','barber','client')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barberAvailabilityService.findOne(+id);
  }
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBarberAvailabilityDto: UpdateBarberAvailabilityDto) {
    return this.barberAvailabilityService.update(+id, updateBarberAvailabilityDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.barberAvailabilityService.remove(+id);
  }
}
