import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { BarberAvailability } from 'src/barber-availability/entities/barber-availability.entity';
import { Service } from 'src/services/entities/service.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([User,BarberAvailability,Service,Reservation])
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
