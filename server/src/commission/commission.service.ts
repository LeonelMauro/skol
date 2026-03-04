import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Commission } from './entities/commission.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(Commission)
    private readonly commissionRepo: Repository<Commission>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ){}
  async create(dto: CreateCommissionDto) {
    const barber = await this.userRepo.findOne({
      where:{ id:dto.barberId}, 
      
    });

    if (!barber){
      throw new NotFoundException('El barbero no existe')
    }
    const existing = await this.commissionRepo.findOne({
      where: { barber: { id: dto.barberId } },
    });

    if (existing) {
      throw new BadRequestException(
        'El barbero ya tiene una comisión asignada'
      );
    }
    const commission = this.commissionRepo.create({
      barber,
      percentage: dto.percentage, 
    })

    return await this.commissionRepo.save(commission);
  }

  findAll() {
    return `This action returns all commission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commission`;
  }

  async update(barberId: number, dto: UpdateCommissionDto) {

    const commission = await this.commissionRepo.findOne({
      where: { barber: { id: barberId } },
    });

    if (!commission) {
      throw new NotFoundException('Comisión no encontrada');
    }

    commission.percentage = dto.percentage;

    return await this.commissionRepo.save(commission);
  }

  remove(id: number) {
    return `This action removes a #${id} commission`;
  }
}
