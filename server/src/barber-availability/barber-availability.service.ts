import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBarberAvailabilityDto } from './dto/create-barber-availability.dto';
import { UpdateBarberAvailabilityDto } from './dto/update-barber-availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { BarberAvailability } from './entities/barber-availability.entity';
import { DayOfWeekES } from './day-of-week-es.enum';
import { DayOfWeek } from '../barber-availability/day-of-week.enum';
import { BarberAvailabilityResponseDto } from './dto/barber-availability-response.dto';

@Injectable()
export class BarberAvailabilityService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(BarberAvailability)
    private readonly barberAvailRepository: Repository<BarberAvailability>
  ){}

  async create(dto: CreateBarberAvailabilityDto) {
  const barber = await this.userRepository.findOne({
    where: { id: dto.barberId },
    relations: ['location'],
  });

  if (!barber) {
    throw new NotFoundException('No se encontró el barber');
  }

  const availability = this.barberAvailRepository.create({
    barber,
    day_of_week: dto.day_of_week as DayOfWeek, // 👈 CAST CORRECTO
    start_time: dto.start_time,
    end_time: dto.end_time,
  });

  return this.barberAvailRepository.save(availability);
}

  
async findAll(): Promise<BarberAvailabilityResponseDto[]> {
  const data = await this.barberAvailRepository.find({
    relations: ['barber', 'barber.location'],
  });

  return data.map(a => ({
    id: a.id,
    day_of_week: a.day_of_week, // se mantiene por compatibilidad
    day_of_week_es: DayOfWeekES[a.day_of_week], // 👈 español
    start_time: a.start_time,
    end_time: a.end_time,
    is_active: a.is_active,
    barber: {
      id: a.barber.id,
      name: a.barber.name,
      email: a.barber.email,
      location: a.barber.location
        ? {
            id: a.barber.location.id,
            name: a.barber.location.name,
            address: a.barber.location.address,
          }
        : undefined,
    },
  }));
}


  async findOne(id: number) {
  const availability = await this.barberAvailRepository.findOne({
    where: { id },
    relations: {
      barber: {
        location: true,
      },
    },
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
  
  if (dto.day_of_week !== undefined) {
  availability.day_of_week = dto.day_of_week as DayOfWeek;
}

  if(dto.end_time !== undefined){
    availability.end_time = dto.end_time;
  }

  if(dto.start_time !== undefined){
    availability.start_time= dto.start_time
  }
  if(dto.is_active !== undefined){
    availability.is_active= dto.is_active
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
  async findByBarber(barberId: number) {
  return this.barberAvailRepository.find({
    where: { barber: { id: barberId } },
    relations: ['barber'],
  });
}

}
