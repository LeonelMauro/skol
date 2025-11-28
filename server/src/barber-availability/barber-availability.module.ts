import { Module } from '@nestjs/common';
import { BarberAvailabilityService } from './barber-availability.service';
import { BarberAvailabilityController } from './barber-availability.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarberAvailability } from './entities/barber-availability.entity';
import { User } from 'src/user/entities/user.entity';
import { Service } from 'src/services/entities/service.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([BarberAvailability, User, Service])
  ],
  controllers: [BarberAvailabilityController],
  providers: [BarberAvailabilityService],
})
export class BarberAvailabilityModule {}
