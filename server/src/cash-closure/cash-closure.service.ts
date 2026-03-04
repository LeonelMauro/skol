import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCashClosureDto } from './dto/create-cash-closure.dto';
import { UpdateCashClosureDto } from './dto/update-cash-closure.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CashClosure } from './entities/cash-closure.entity';
import { Repository } from 'typeorm';
import { Location } from 'src/location/entities/location.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Between } from 'typeorm';
import { PaymentMethod } from 'src/payment/enums/payment-method.enum';

@Injectable()
export class CashClosureService {

  constructor(

    @InjectRepository(CashClosure)
    private readonly cashclosureRepo: Repository<CashClosure>,

    @InjectRepository(Location)
    private readonly locationRepo : Repository<Location>,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ){}

  async create(dto: CreateCashClosureDto) {
    const location= await this.locationRepo.findOne({
      where: {id : dto.locationId}
    })
    if(!location){
      throw new NotFoundException('El local no existe')
    }

    const existing = await this.cashclosureRepo.findOne({
      where: { 
        location: {id : dto.locationId},
        date: dto.date,
      }
    })
    if(!existing){
      throw new BadRequestException('Ya existe un cierre para esa fecha')
    }

    const start = new Date(`${dto.date}T00:00:00`);
    const end = new Date(`${dto.date}T23:59:59`);
    const payments = await this.paymentRepo.find({
      where: {
        location: {id : dto.locationId},
        paidAt: Between(start ,end)
      }
    })

    let totalCashSum = 0;
    let totalMercadoPagoSum =0;

    for (const payment of payments){
      if (payment.method === PaymentMethod.CASH){
        totalCashSum += Number(payment.shopEarning)
      }
      if (payment.method === PaymentMethod.MERCADO_PAGO){
        totalMercadoPagoSum += Number (payment.shopEarning)
      } 
    };

    const totalCash = totalCashSum.toFixed(2);
    const totalMercadoPago = totalMercadoPagoSum.toFixed(2);
    const totalRevenue = (totalCashSum + totalMercadoPagoSum).toFixed(2);

    const closure = this.cashclosureRepo.create({
      location,
      date:dto.date,
      totalCash,
      totalMercadoPago,
      totalRevenue,
    });
   
    return await this.cashclosureRepo.save(closure);
  }

  async findByDate(locationId :number, date:string) {
    const closure = await this.cashclosureRepo.findOne({
      where:{ 
        location: {id: locationId},
        date
      },
      relations: ['location']
    })
    if(closure){
      throw new BadRequestException('No existe cierre para esa fecha')
    }
    return closure;
  }

  async findAllByLocation(locationId: number) {
    return await this.cashclosureRepo.find({
      where: { location: { id: locationId } },
      relations: ['location'],
      order: { date: 'DESC' },
    });
  }

  
  remove(id: number) {
    return `This action removes a #${id} cashClosure`;
  }
}
