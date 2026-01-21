import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { BarberAvailability } from 'src/barber-availability/entities/barber-availability.entity';
import { Service } from 'src/services/entities/service.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { MailModule } from 'src/mail/mail.module';
import { BookingsReminderService } from './bookings-reminder.service';
import { Location } from 'src/location/entities/location.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([User,BarberAvailability,Service,Reservation,Location]),MailModule
  ],
  controllers: [BookingsController],
  providers: [BookingsService,BookingsReminderService],
})
export class BookingsModule {}
