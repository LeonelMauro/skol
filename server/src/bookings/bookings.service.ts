import {  Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BarberAvailability } from 'src/barber-availability/entities/barber-availability.entity';
import { Reservation,ReservationStatus} from 'src/reservation/entities/reservation.entity';
import { Service } from 'src/services/entities/service.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { MailService } from 'src/mail/mail.service';
import { Logger } from '@nestjs/common';


@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    @InjectRepository(BarberAvailability)
    private readonly barberAvailabilityRepository: Repository<BarberAvailability>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    private readonly mailService: MailService,


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

    const savedReservation = await this.reservationRepository.save(newReservation);

    
    this.sendReservationCreatedEmails(savedReservation);

    return savedReservation;

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
    const saved = await this.reservationRepository.save(reservation);

    this.sendReservationConfirmedEmails(saved);

    return saved;
  }


  async canceledReservation(reservationId: number) {
  const reservation = await this.reservationRepository.findOne({
    where: { id: reservationId },
    relations: ['client', 'barber', 'service'],
  });

  if (!reservation) {
    throw new NotFoundException('No se encontró la reserva');
  }

  if (reservation.status === ReservationStatus.CANCELED) {
    throw new BadRequestException('La reserva ya fue cancelada');
  }

  reservation.status = ReservationStatus.CANCELED;
  const saved = await this.reservationRepository.save(reservation);

  this.sendReservationCanceledEmails(saved);


  return saved;
}
  //Metodos Privado Crear//

private async sendReservationCreatedEmails(reservation: Reservation) {
  try {
    await this.mailService.sendMail(
      reservation.client.email,
      'Reserva creada - Skol Barbería',
      this.buildClientCreatedTemplate(reservation),
    );

    await this.mailService.sendMail(
      reservation.barber.email,
      'Nueva reserva asignada',
      this.buildBarberCreatedTemplate(reservation),
    );
  } catch (error) {
    this.logger.error(
      `Error enviando mails de creación (reserva ${reservation.id})`,
      error.stack,
    );
  }
};

private buildClientCreatedTemplate(reservation: Reservation): string {
  return `
    <h2>Reserva creada</h2>
    <p>Hola ${reservation.client.name},</p>
    <p>Tu reserva fue creada correctamente.</p>
    <p>
      <strong>Barbero:</strong> ${reservation.barber.name}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
    </p>
  `;
}

private buildBarberCreatedTemplate(reservation: Reservation): string {
  return `
    <h2>Nueva reserva</h2>
    <p>Tenés una nueva reserva asignada.</p>
    <p>
      <strong>Cliente:</strong> ${reservation.client.name}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
    </p>
  `;
}
 
//Metodos Privado confimar//

private async sendReservationConfirmedEmails(reservation: Reservation) { 
  try {
    await this.mailService.sendMail(
      reservation.client.email,
      'Reserva confirmada - Skol Barbería',
      this.buildClientConfirmedTemplate(reservation),
    );

    await this.mailService.sendMail(
      reservation.barber.email,
      'Reserva confirmada - Skol Barbería',
      this.buildBarberConfirmedTemplate(reservation),
    );
  } catch (error) {
    this.logger.error(
      
      `Error en confimar la reserva (reserva ${reservation.id})`,
      error.stack,
    );
  }
}
private buildClientConfirmedTemplate(reservation: Reservation): string {
  return `
    <h2>Reserva confirmada</h2>
    <p>Hola ${reservation.client.name},</p>
    <p>Tu reserva fue confirmada.</p>
    <p>
      <strong>Barbero:</strong> ${reservation.barber.name}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
    </p>
  `;
}
private buildBarberConfirmedTemplate(reservation: Reservation): string {
  return `
    <h2>Reserva confirmada</h2>
    <p>Tenés una  reserva confirmada.</p>
    <p>
      <strong>Cliente:</strong> ${reservation.client.name}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
    </p>
  `;
}

 //Metodos Privado Cancelar//

private async sendReservationCanceledEmails(reservation: Reservation) {
  try {
    await this.mailService.sendMail(
      reservation.client.email,
      'Reserva cancelada - Skol Barbería',
      this.buildClientCanceledTemplate(reservation),
    );

    await this.mailService.sendMail(
      reservation.barber.email,
      'Reserva cancelada',
      this.buildBarberCanceledTemplate(reservation),
    );
  } catch (error) {
    this.logger.error(
      `Error enviando mails de cancelación (reserva ${reservation.id})`,
      error.stack,
    );
  }
}
private buildClientCanceledTemplate(reservation: Reservation): string {
  return `
    <h2>Reserva cancelada</h2>
    <p>Hola ${reservation.client.name},</p>
    <p>Tu reserva fue cancelada.</p>
    <p>
      <strong>Barbero:</strong> ${reservation.barber.name}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
    </p>
  `;
}
private buildBarberCanceledTemplate(reservation: Reservation): string {
  return `
    <h2>Reserva cancelada</h2>
    <p>Tenés una reserva cancelada.</p>
    <p>
      <strong>Cliente:</strong> ${reservation.client.name}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
    </p>
  `;
}

}
