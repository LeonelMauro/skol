import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Service } from 'src/services/entities/service.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([User,Role,Service])
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
