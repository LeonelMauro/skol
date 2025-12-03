import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Service } from 'src/services/entities/service.entity';
import moment from 'moment';
import { BarberAvailability } from 'src/barber-availability/entities/barber-availability.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    @InjectRepository(BarberAvailability)
    private readonly barberAvailRepository: Repository<BarberAvailability>

  ){}

  async create(dto: CreateReservationDto) {
  const client = await this.userRepository.findOne({ where: { id: dto.clientId }});
  if (!client) throw new NotFoundException('No se encontro cliente');

  const barber = await this.userRepository.findOne({ where: { id: dto.barberId }});
  if (!barber) throw new NotFoundException('No se encontro Barber');

  const service = await this.serviceRepository.findOne({ where: { id: dto.serviceId }});
  if (!service) throw new NotFoundException('No se encontro el servicio');

  // --- VALIDACIÓN DEL DÍA ---
  const dayOfWeek = moment(dto.date).format('dddd').toLowerCase(); // monday, tuesday...

  const availability = await this.barberAvailRepository.findOne({
    where: {
      barber: { id: barber.id },
      day_of_week: dayOfWeek,
      is_active: true
    }
  });

  if (!availability) {
    throw new NotFoundException(`El barbero no trabaja el día ${dayOfWeek}`);
  }

  // --- VALIDACIÓN DE HORARIOS ---
  const requested = moment(dto.time, "HH:mm");
  const start = moment(availability.start_time, "HH:mm");
  const end = moment(availability.end_time, "HH:mm");

  if (!requested.isBetween(start, end, undefined, '[]')) {
    throw new NotFoundException(
      `El barbero no trabaja en el horario solicitado (${availability.start_time} - ${availability.end_time})`
    );
  }

  // --- VALIDACIÓN DE CHOQUE DE RESERVAS ---
  const overlapping = await this.reservationRepository.findOne({
    where: {
      barber: { id: barber.id },
      date: dto.date,
      time: dto.time
    }
  });

  if (overlapping) {
    throw new NotFoundException(`Ese horario ya está reservado con ese barbero`);
  }

  const reservation = this.reservationRepository.create({
    date: dto.date,
    time: dto.time,
    client,
    barber,
    service
  });

  return await this.reservationRepository.save(reservation);
}


  findAll() {
    return this.reservationRepository.find({
      relations:{
        client: true,
        barber:true, 
        service: true}
  });
  }

  async findOne(id: number) {
    const reservation= await this.reservationRepository.findOne({ 
      where: {id},
      relations:{
        client: true,
        barber:true, 
        service: true}
  })
  if(!reservation){
    throw new NotFoundException('No se encontro la reserva')
  }
    return reservation ;
  }

  async update(id: number, dto: UpdateReservationDto) {
  const reservation = await this.reservationRepository.findOne({
    where: { id },
    relations: { client: true, barber: true, service: true }
  });

  if (!reservation) {
    throw new NotFoundException('Reserva no encontrada');
  }

  // Si cambia el cliente
  if (dto.clientId !== undefined) {
    const client = await this.userRepository.findOne({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException('No se encontró el cliente');
    }
    reservation.client = client;
  }

  // Si cambia el barbero
  if (dto.barberId !== undefined) {
    const barber = await this.userRepository.findOne({
      where: { id: dto.barberId },
    });
    if (!barber) {
      throw new NotFoundException('No se encontró el barbero');
    }
    reservation.barber = barber;
  }

  // Si cambia el servicio
  if (dto.serviceId !== undefined) {
    const service = await this.serviceRepository.findOne({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException('No se encontró el servicio');
    }
    reservation.service = service;
  }

  // Si cambia fecha
  if (dto.date !== undefined) {
    reservation.date = dto.date;
  }

  // Si cambia hora
  if (dto.time !== undefined) {
    reservation.time = dto.time;
  }

  // Si cambia estado
  if (dto.status !== undefined) {
    reservation.status = dto.status;
  }

  return await this.reservationRepository.save(reservation);
}


  async remove(id: number) {
    const reservation= await this.reservationRepository.findOne({where: {id}});
    if(!reservation){
      throw new NotFoundException('No se encontro reserva')
    }
    return  this.reservationRepository.remove(reservation);
  }
}
