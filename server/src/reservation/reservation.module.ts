import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Service } from 'src/services/entities/service.entity';
import { Reservation } from './entities/reservation.entity';
import { BarberAvailability } from 'src/barber-availability/entities/barber-availability.entity';
import { Location } from 'src/location/entities/location.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([User,Service,Reservation,BarberAvailability,Location])
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
