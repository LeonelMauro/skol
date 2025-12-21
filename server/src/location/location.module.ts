import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports:[
      TypeOrmModule.forFeature([User,Location])
    ],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
