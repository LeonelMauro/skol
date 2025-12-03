import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBarberAvailabilityDto } from './dto/create-barber-availability.dto';
import { UpdateBarberAvailabilityDto } from './dto/update-barber-availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { BarberAvailability } from './entities/barber-availability.entity';

@Injectable()
export class BarberAvailabilityService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(BarberAvailability)
    private readonly barberAvailRepository: Repository<BarberAvailability>
  ){}

  async create(dto: CreateBarberAvailabilityDto) {
    const barber= await this.userRepository.findOne({ where: { id: +dto.barberId}})
    if(!barber){
      throw new NotFoundException('No se encontro barber')
    }
    const availability=  this.barberAvailRepository.create({
      barber,
      ... dto
    })
    return this.barberAvailRepository.save(availability);
  }

  findAll() {
    return this.barberAvailRepository.find();
  }

  async findOne(id: number) {
    const availability = await this.barberAvailRepository.findOne({
      where: { id },
      relations: { barber: true }
    });

    if (!availability) {
      throw new NotFoundException('No se encontró disponibilidad');
    }

    return availability;
  }


  async update(id: number, dto: UpdateBarberAvailabilityDto) {
    const availability= await this.barberAvailRepository.findOne({ 
      where: {id },
      relations:{barber:true}
  })
  if(!availability){
    throw new NotFoundException('No se encontro avilitacion actual')
  }

  if(dto.barberId !== undefined){
    const barber = await this.userRepository.findOne({
      where: {id: dto.barberId}
    })
    if(!barber){
      throw new NotFoundException('No se encontro barber')
    }
    availability.barber =barber
  }
  
  if(dto.day_of_week !== undefined){
    availability.day_of_week= dto.day_of_week
  }

  if(dto.end_time !== undefined){
    availability.end_time = dto.end_time;
  }

  if(dto.start_time !== undefined){
    availability.start_time= dto.start_time
  }

    return await this.barberAvailRepository.save(availability);
  }

  async remove(id: number) {
    const availability= await this.barberAvailRepository.findOne({
      where: {id}
    })
    if(!availability){
      throw new NotFoundException('No se encontro Avilitacion')
    }
    return this.barberAvailRepository.remove(availability);
  }
}
