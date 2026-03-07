import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/location/entities/location.entity';
import { Commission } from 'src/commission/entities/commission.entity';
import { DataSource } from 'typeorm';
import { ReservationStatus } from 'src/reservation/entities/reservation.entity';
import { Between } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(

    private readonly dataSource: DataSource,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,

    @InjectRepository(Commission)
    private readonly commissionRepo: Repository<Commission>,
  ){}

  async create(dto: CreatePaymentDto) {
    const reservation= await this.reservationRepo.findOne({
      where: { id: dto.reservationId},
      relations: ['location','barber','service','payment']
    })
    if(!reservation){
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reservation.payment) {
      throw new BadRequestException('La reserva ya fue pagada');
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('La reserva no está confirmada');
    }

    const commission = await this.commissionRepo.findOne({
      where: {
        barber: { id: reservation.barber.id },
      
      },
    });
    
    if(!commission){
      throw new BadRequestException('El barbero no tiene comisión activa');
    }

    const servicePrice = Number(reservation.service.price);
    const percentage = Number(commission.percentage);

    const barberEarning = (servicePrice * percentage) / 100;
    const shopEarning = servicePrice - barberEarning;

    const payment = this.paymentRepo.create({
      reservation,
      barber: reservation.barber,
      location: reservation.location,
      servicePrice,
      commissionPercentage: percentage,
      barberEarning,
      shopEarning,
      method: dto.method,
    });

    await this.dataSource.transaction(async (manager) => {
      await manager.save(payment);

      reservation.status = ReservationStatus.COMPLETED;
      reservation.completedAt = new Date();
      reservation.payment = payment;

      await manager.save(reservation);
    });
    return {
      message: 'Pago realizado correctamente',
      paymentId: payment.id,
    };
  }

  async getBarberTodayMetrics(barberId: number) {

  const today = new Date();

  const start = new Date();
  start.setHours(0,0,0,0);

  const end = new Date();
  end.setHours(23,59,59,999);

 
  const payments = await this.paymentRepo.find({
    where: {
      barber: { id: barberId },
      paidAt: Between(start, end),
      
    }
  });

  let cash = 0;
  let mp = 0;
  let total = 0;

  payments.forEach(p => {

    total += Number(p.barberEarning);

    if(p.method === 'cash'){
      cash += Number(p.barberEarning);
    }

    if(p.method === 'mercado_pago'){
      mp += Number(p.barberEarning);
    }

  });

  return {
    servicesDone: payments.length,
    totalEarned: total,
    cash,
    mercadoPago: mp
  };
}
}
