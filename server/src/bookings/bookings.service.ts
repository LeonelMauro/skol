import {  Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BarberAvailability } from 'src/barber-availability/entities/barber-availability.entity';
import { Reservation,ReservationStatus} from 'src/reservation/entities/reservation.entity';
import { Service } from 'src/services/entities/service.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    @InjectRepository(BarberAvailability)
    private readonly barberAvailabilityRepository: Repository<BarberAvailability>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async getAvailableSlots(barberId: number, date: string, serviceId: number) {

    // Validar fecha
    const jsDate = new Date(date + 'T00:00:00');
    if (isNaN(jsDate.getTime())) {
      throw new BadRequestException('Fecha inválida. Formato esperado: YYYY-MM-DD');
    }

    const weekday = jsDate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    // 1️⃣ Verificar barbero
    const barber = await this.userRepository.findOne({ where: { id: barberId } });
    if (!barber) throw new NotFoundException('No se encontró el barbero');

    // 2️⃣ Verificar servicio
    const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('No se encontró el servicio');

    const duration = service.duration_minutes;

    // 3️⃣ Buscar disponibilidad
    const availability = await this.barberAvailabilityRepository.findOne({
      where: {
        barber: { id: barberId },
        day_of_week: weekday,
        is_active: true,
      },
    });

    if (!availability) {
      throw new NotFoundException(`El barbero no trabaja el día ${weekday}`);
    }

    // 4️⃣ Crear horarios disponibles
    const slots = this.generateTimeSlots(
      availability.start_time,
      availability.end_time,
      duration,
    );

    // 5️⃣ Reservas existentes
    const reservations = await this.reservationRepository.find({
      where: { barber: { id: barberId }, date },
    });

    const reservedTimes = reservations.map(r => r.time);

    const availableSlots = slots.filter(t => !reservedTimes.includes(t));

    return {
      barberId,
      date,
      serviceDuration: duration,
      availableSlots,
    };
  }

  private generateTimeSlots(start: string, end: string, duration: number): string[] {
    const result: string[] = [];

    let [h, m] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    while (h < endH || (h === endH && m < endM)) {
      const hour = h.toString().padStart(2, '0');
      const minutes = m.toString().padStart(2, '0');

      result.push(`${hour}:${minutes}`);

      m += duration;

      if (m >= 60) {
        h += Math.floor(m / 60);
        m = m % 60;
      }
    }

    return result;
  }

  async create(dto:CreateBookingDto){
    const barber = await this.userRepository.findOne({where: {id: dto.barberId}})
    if(!barber){ throw new NotFoundException('No se encontró el barbero')}
   
    const service = await this.serviceRepository.findOne({ where: {id : dto.serviceId}})
    if(!service){ throw new NotFoundException('No se encontró el servicio')}

    const client= await this.userRepository.findOne({where: {id: dto.clientId}})
    if(!client){ throw new NotFoundException('No se encontró el cliente')}
    
    const availability= await this.barberAvailabilityRepository.findOne({
      where: {id: dto.barberAvailability, barber:{id: dto.barberId}}})
    if(!availability){ throw new NotFoundException('No se encontró la disponibilidad seleccionada para este barbero')}
    
    // 5️⃣ Validar que el día coincida
    const jsDate = new Date(dto.date + 'T00:00:00')
    if (isNaN(jsDate.getTime())) {
      throw new BadRequestException('Fecha inválida. Formato esperado: YYYY-MM-DD');
    };
    
    // Validar fecha
    const weekday = jsDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
   
  
    if (weekday !== availability.day_of_week) {
      throw new NotFoundException(
        `El barbero no trabaja ese día. Día correcto: ${availability.day_of_week}`
      );
    }

    // 6️⃣ Validar horario dentro del rango disponible
    const start = availability.start_time; // "09:00"
    const end = availability.end_time;     // "13:00"

    if (dto.time < start || dto.time >= end) {
      throw new NotFoundException(
        `El horario ${dto.time} está fuera del rango permitido (${start} - ${end})`
      );
    }

    // 7️⃣ Validar que el horario NO esté ocupado
    const existingReservation = await this.reservationRepository.findOne({
      where: { barber: { id: dto.barberId },date: dto.date,time: dto.time }
    });

    if (existingReservation) {
      throw new NotFoundException("Ese horario ya está reservado");
    }

    // 8️⃣ Crear reserva
    const newReservation = this.reservationRepository.create({
      client,
      barber,
      service,
      date: dto.date,
      time: dto.time,
      status: ReservationStatus.PENDING
    });

    return await this.reservationRepository.save(newReservation);
    }
    async update(id: number, dto: UpdateBookingDto) {
    // 1️⃣ Buscar reserva existente
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['barber', 'client', 'service']
    });

    if (!reservation) {
      throw new NotFoundException('No se encontró la reserva');
    }

    // 2️⃣ Actualizar servicio si se envía
    if (dto.serviceId) {
      const newService = await this.serviceRepository.findOne({
        where: { id: dto.serviceId }
      });
      if (!newService)
        throw new NotFoundException('No se encontró el servicio');

      reservation.service = newService;
    }

    // 3️⃣ Si cambian "date" o "time", validar disponibilidad
    const newDate = dto.date ?? reservation.date;
    const newTime = dto.time ?? reservation.time;

    // Obtener disponibilidad del barbero para ese día
    const jsDate = new Date(newDate + 'T00:00');
    const weekday = jsDate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    const availability = await this.barberAvailabilityRepository.findOne({
      where: {
        barber: { id: reservation.barber.id },
        day_of_week: weekday,
        is_active: true
      }
    });

    if (!availability) {
      throw new NotFoundException(
        `El barbero no trabaja el día ${weekday}`
      );
    }

    // Validar rango horario
    if (newTime < availability.start_time || newTime >= availability.end_time) {
      throw new BadRequestException(
        `El horario ${newTime} está fuera del rango permitido (${availability.start_time} - ${availability.end_time})`
      );
    }

    // Validar si NO está reservado ya ese horario
    const exists = await this.reservationRepository.findOne({
      where: {
        barber: { id: reservation.barber.id },
        date: newDate,
        time: newTime
      }
    });

    if (exists && exists.id !== reservation.id) {
      throw new BadRequestException("Ese horario ya está reservado");
    }

    // 4️⃣ Aplicar actualizaciones
    reservation.date = newDate;
    reservation.time = newTime;

    if (dto.status) {
      reservation.status = dto.status;
    }

    return await this.reservationRepository.save(reservation);
  }
    async confirmReservation(reservationId: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['client', 'barber', 'service'],
    });

    if (!reservation) {
      throw new NotFoundException('No se encontró la reserva');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        `La reserva no puede ser confirmada porque está en estado ${reservation.status}`
      );
    }

    reservation.status = ReservationStatus.CONFIRMED;

    return await this.reservationRepository.save(reservation);
  }

  async canceledReservation(reservationId){
    const reservation = await this.reservationRepository.findOne({
      where: {id: reservationId},
      relations: ['client','barber','service']
    })
    if (!reservation){
      throw new NotFoundException('No se encontro reserva')
    }
    if(reservation.status === ReservationStatus.CANCELED){
      throw new NotFoundException('La reserva ya fue cancelada')
    }
    reservation.status = ReservationStatus.CANCELED
    
    return this.reservationRepository.save(reservation)
  }


}
