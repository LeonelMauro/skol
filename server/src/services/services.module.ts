import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { User } from 'src/user/entities/user.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Service,User,Reservation])
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
