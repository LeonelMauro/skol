// src/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payment } from './entities/payment.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/location/entities/location.entity';

import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Commission } from 'src/commission/entities/commission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Reservation,
      User,
      Location,
      Commission
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}