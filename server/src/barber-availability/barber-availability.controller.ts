import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BarberAvailabilityService } from './barber-availability.service';
import { CreateBarberAvailabilityDto } from './dto/create-barber-availability.dto';
import { UpdateBarberAvailabilityDto } from './dto/update-barber-availability.dto';

@Controller('barber-availability')
export class BarberAvailabilityController {
  constructor(private readonly barberAvailabilityService: BarberAvailabilityService) {}

  @Post()
  create(@Body() createBarberAvailabilityDto: CreateBarberAvailabilityDto) {
    return this.barberAvailabilityService.create(createBarberAvailabilityDto);
  }

  @Get()
  findAll() {
    return this.barberAvailabilityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barberAvailabilityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBarberAvailabilityDto: UpdateBarberAvailabilityDto) {
    return this.barberAvailabilityService.update(+id, updateBarberAvailabilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.barberAvailabilityService.remove(+id);
  }
}
