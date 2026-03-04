// src/commission/commission.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Commission } from './entities/commission.entity';
import { User } from 'src/user/entities/user.entity';

import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Commission,
      User,
    ]),
  ],
  controllers: [CommissionController],
  providers: [CommissionService],
})
export class CommissionModule {}