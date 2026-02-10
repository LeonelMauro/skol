import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateDirectBookingDto } from './dto/createDirect-booking.dto';


@Controller('bookings')

export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
  @Get()
  findAll() {
  return this.bookingsService.findAll();
}
  @Get('pending')
  findPending() {
    return this.bookingsService.findPending();
  }

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

  @Post('barber/direct')
  createDirectBooking(@Body() dto: CreateDirectBookingDto) {
  return this.bookingsService.createDirect(dto);
  }


  @Patch(':id')
  updateBooking(
    @Param('id') id: number,@Body() dto: UpdateBookingDto
  ) {
    return this.bookingsService.update(id, dto);
  }
  @Post(':id/confirm')
  confirm(@Param('id') id: number) {
    return this.bookingsService.confirmReservation(id);}

  @Post(':id/canceled')
  canceled(@Param('id') id: number){
    return this.bookingsService.canceledReservation(id)
  }
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyReservations(@Req() req) {
    return this.bookingsService.findMyReservations(req.user.sub);
  }
  @Post(':id/complete')
  complete(@Param('id') id: number) {
    return this.bookingsService.completeReservation(id);
  }
  @Post(':id/no-show')
  noShow(@Param('id') id: number) {
    return this.bookingsService.markNoShow(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('barber/today')
  getTodayBookingsForBarber(@Req() req) {
    return this.bookingsService.getTodayBookingsForBarber(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Get('barber/history')
  getBarberHistory(@Req() req) {
    return this.bookingsService.getBarberHistory(req.user.sub);
  }


}
