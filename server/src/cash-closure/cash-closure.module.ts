// src/cash-closure/cash-closure.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CashClosure } from './entities/cash-closure.entity';
import { Location } from 'src/location/entities/location.entity';
import { Payment } from 'src/payment/entities/payment.entity';

import { CashClosureService } from './cash-closure.service';
import { CashClosureController } from './cash-closure.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CashClosure,
      Location,
      Payment,
    ]),
  ],
  controllers: [CashClosureController],
  providers: [CashClosureService],
})
export class CashClosureModule {}