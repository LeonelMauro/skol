import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { ServicesModule } from './services/services.module';
import { ReservationModule } from './reservation/reservation.module';
import { BarberAvailabilityModule } from './barber-availability/barber-availability.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
  ScheduleModule.forRoot(),
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      type: 'postgres',
      host: config.get<string>('DB_HOST'),
      port: config.get<number>('DB_PORT'),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      database: config.get<string>('DB_NAME'),
      autoLoadEntities: true,
      synchronize: true,
    }),
    inject: [ConfigService],
  }),
  UserModule,
  RolesModule,
  ServicesModule,
  ReservationModule,
  BarberAvailabilityModule,
  AuthModule,
  BookingsModule,
  MailModule,
  LocationModule,
],

  controllers: [],
  providers: [],
})
export class AppModule {}
