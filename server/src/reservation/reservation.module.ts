import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Service } from 'src/services/entities/service.entity';
import { Reservation } from './entities/reservation.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([User,Service,Reservation])
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
