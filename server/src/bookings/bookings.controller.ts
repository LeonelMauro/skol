import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking';
import { UpdateBookingDto } from './dto/update-booking.dto';


@Controller('bookings')

export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('barbers/:barberId/available-slots')
  getAvailableSlots(
    @Param('barberId') barberId: number,
    @Query('date') date: string,
    @Query('serviceId') serviceId: number
  ) {
    return this.bookingsService.getAvailableSlots(barberId, date, serviceId);
  }

  @Post()
  create(@Body()dto : CreateBookingDto){
    return this.bookingsService.create(dto)
  }

  @Patch(':id')
  updateBooking(
    @Param('id') id: number,@Body() dto: UpdateBookingDto
  ) {
    return this.bookingsService.update(id, dto);
  }

}
