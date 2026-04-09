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
  private getDateRange(period: 'day' | 'week' | 'month') {
  const now = new Date();

  let start = new Date();
  let end = new Date();

  if (period === 'day') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  if (period === 'week') {
    const day = now.getDay(); 
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);

    start = new Date(now);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    end = new Date();
    end.setHours(23, 59, 59, 999);
  }

  if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
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
      
    },
    relations: ['reservation','service']
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
    mercadoPago: mp,
    commissionPercentage: payments.length ? payments[0].commissionPercentage : 0
  };
}
async getBarberMetrics(barberId: number, period: 'day' | 'week' | 'month') {

  const { start, end } = this.getDateRange(period);

  const payments = await this.paymentRepo.find({
    where: {
      barber: { id: barberId },
      paidAt: Between(start, end),
    },
  });

  let barberTotal = 0;
  let shopTotal = 0;
  let cash = 0;
  let mercadoPago = 0;

  payments.forEach(p => {
    barberTotal += Number(p.barberEarning);
    shopTotal += Number(p.shopEarning);

    if (p.method === 'cash') cash += Number(p.barberEarning);
    if (p.method === 'mercado_pago') mercadoPago += Number(p.barberEarning);
  });

  return {
    services: payments.length,
    barberTotal,
    shopTotal,
    totalGenerated: barberTotal + shopTotal,
    cash,
    mercadoPago,
    commissionPercentage: payments.length
    ? payments[0].commissionPercentage
    : 0
  };
}
async getShopMetrics() {
  const payments = await this.paymentRepo.find();

  let barberTotal = 0;
  let shopTotal = 0;

  payments.forEach(p => {
    barberTotal += Number(p.barberEarning);
    shopTotal += Number(p.shopEarning);
  });

  return {
    barberPaid: barberTotal,
    shopRevenue: shopTotal,
    totalRevenue: barberTotal + shopTotal,
    services: payments.length
  };
}
}
