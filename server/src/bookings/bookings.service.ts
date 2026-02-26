import {  Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BarberAvailability } from 'src/barber-availability/entities/barber-availability.entity';
import { Reservation,ReservationStatus} from 'src/reservation/entities/reservation.entity';
import { Service } from 'src/services/entities/service.entity';
import { User } from 'src/user/entities/user.entity';
import { DeepPartial, In, Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { MailService } from 'src/mail/mail.service';
import { Logger } from '@nestjs/common';
import { DayOfWeek } from 'src/barber-availability/day-of-week.enum';
import { Location } from 'src/location/entities/location.entity';
import { CreateDirectBookingDto } from './dto/createDirect-booking.dto';



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


    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,

    private readonly mailService: MailService,


  ) {}
  async findAll() {
  return this.reservationRepository.find({
    relations: ['client', 'barber', 'service', 'location'],
    order: { date: 'ASC', time: 'ASC' },
  });
}

async findPending() {
  return this.reservationRepository.find({
    where: { status: ReservationStatus.PENDING },
    relations: ['client', 'barber', 'service'],
  });
}


  async getAvailableSlots(barberId: number, date: string, serviceId: number) {

    // Validar fecha
    const jsDate = new Date(date + 'T00:00:00');
    if (isNaN(jsDate.getTime())) {
      throw new BadRequestException('Fecha inválida. Formato esperado: YYYY-MM-DD');
    }

    const weekday = jsDate
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as DayOfWeek;


    // 1️⃣ Verificar barbero
    const barber = await this.userRepository.findOne({ where: { id: barberId } });
    if (!barber) throw new NotFoundException('No se encontró el barbero');

    // 2️⃣ Verificar servicio
    const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('No se encontró el servicio');

    const duration = service.duration_minutes;

    // 3️⃣ Buscar disponibilidad
    const availabilities = await this.barberAvailabilityRepository.find({
      where: {
        barber: { id: barberId },
        day_of_week: weekday,
        is_active: true,
      },
    });

    if (!availabilities.length) {
  throw new NotFoundException(`El barbero no trabaja el día ${weekday}`);
}


    // 4️⃣ Crear horarios disponibles
    let slots: string[] = [];

    for (const availability of availabilities) {
      const rangeSlots = this.generateTimeSlots(
        availability.start_time,
        availability.end_time,
        duration,
      );

      slots.push(...rangeSlots);
    }
    slots.sort();

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

  async create(dto: CreateBookingDto) {

  let client: User | null = null;

  if (dto.clientId) {
    client = await this.userRepository.findOne({
      where: { id: dto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
  }

  if (!dto.clientId && !dto.guestName) {
    throw new BadRequestException(
      'Debe indicar un cliente registrado o un nombre de cliente'
    );
  }


  const service = await this.serviceRepository.findOne({
    where: { id: dto.serviceId },
  });
  if (!service) throw new NotFoundException('Servicio no encontrado');

  const location = await this.locationRepository.findOne({
    where: { id: dto.locationId },
  });
  if (!location) {
  throw new NotFoundException('Local no encontrado');
}



  let barber: User;

if (dto.barberId) {
  const foundBarber = await this.userRepository.findOne({
    where: { id: dto.barberId },
  });

  if (!foundBarber) {
    throw new NotFoundException('Barbero no encontrado');
  }

  barber = foundBarber; // ✅ ahora TS sabe que es User
} else {
  barber = await this.getAnyAvailableBarber(dto);
}

  const jsDate = new Date(dto.date + 'T00:00:00');
  if (isNaN(jsDate.getTime())) {
    throw new BadRequestException('Fecha inválida');
  }

  const weekday = jsDate
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as DayOfWeek;

  const availabilities = await this.barberAvailabilityRepository.find({
  where: {
    barber: { id: barber.id },
    day_of_week: weekday,
    is_active: true,
  },
});

if (!availabilities.length) {
  throw new BadRequestException('El barbero no trabaja ese día');
}

// Validar que la hora esté dentro de ALGUNO de los rangos
const isWithinSomeRange = availabilities.some(a => {
  return dto.time >= a.start_time && dto.time < a.end_time;
});

if (!isWithinSomeRange) {
  throw new BadRequestException('Horario fuera de rango');
}

  const exists = await this.reservationRepository.findOne({
    where: {
      barber: { id: barber.id },
      date: dto.date,
      time: dto.time,
    },
  });

  if (exists) {
    throw new BadRequestException('Horario no disponible');
  }

  const reservation = this.reservationRepository.create({
    barber,
    service,
    location,
    date: dto.date,
    time: dto.time,
    status: ReservationStatus.PENDING,
    ...(client ? { client } : {}),
    ...(!client && dto.guestName ? { guestName: dto.guestName } : {}),
  });

  const saved = await this.reservationRepository.save(reservation);

  if (this.hasRegisteredClient(saved)) {
    this.sendReservationCreatedEmails(saved);
  }

  return saved;

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
      .toLowerCase() as DayOfWeek;


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
      relations: ['client', 'barber', 'service','location'],
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
    relations: ['client', 'barber', 'service','location'],
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
  if (!this.hasRegisteredClient(reservation)) return;

  try {
    await this.mailService.sendMail(
      reservation.client!.email,
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
private hasRegisteredClient(reservation: Reservation): boolean {
  return !!reservation.client?.email;
}

private buildClientCreatedTemplate(reservation: Reservation): string {
  return `
    <h2>Reserva creada</h2>
    <p>Hola  ${this.getClientName(reservation)},</p>
    <p>Tu reserva fue creada correctamente.</p>
    <p>
      <strong>Barbero:</strong> ${reservation.barber.name}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
      <strong>Local:</strong> ${reservation.location.name} - ${reservation.location.address}

    </p>
  `;
}

private buildBarberCreatedTemplate(reservation: Reservation): string {
  return `
    <h2>Nueva reserva</h2>
    <p>Tenés una nueva reserva asignada.</p>
    <p>
      <strong>Cliente:</strong>  ${this.getClientName(reservation)}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
      <strong>Local:</strong> ${reservation.location.name} - ${reservation.location.address}

    </p>
  `;
}
 
//Metodos Privado confimar//

private async sendReservationConfirmedEmails(reservation: Reservation) { 
   if (!this.hasRegisteredClient(reservation)) return;
  try {
    await this.mailService.sendMail(
      reservation.client!.email,
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
    <p>Hola ${this.getClientName(reservation)},</p>
    <p>Tu reserva fue confirmada.</p>
    <p>
      <strong>Barbero:</strong> ${reservation.barber.name}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
      <strong>Local:</strong> ${reservation.location.name} - ${reservation.location.address}

    </p>
  `;
}
private buildBarberConfirmedTemplate(reservation: Reservation): string {
  return `
    <h2>Reserva confirmada</h2>
    <p>Tenés una  reserva confirmada.</p>
    <p>
      <strong>Cliente:</strong>  ${this.getClientName(reservation)}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
      <strong>Local:</strong> ${reservation.location.name} - ${reservation.location.address}

    </p>
  `;
}

 //Metodos Privado Cancelar//

private async sendReservationCanceledEmails(reservation: Reservation) {
  if (!this.hasRegisteredClient(reservation)) return;
  try {
    await this.mailService.sendMail(
      reservation.client!.email,
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
    <p>Hola ${this.getClientName(reservation)},</p>
    <p>Tu reserva fue cancelada.</p>
    <p>
      <strong>Barbero:</strong> ${reservation.barber.name}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
      <strong>Local:</strong> ${reservation.location.name} - ${reservation.location.address}

    </p>
  `;
}
private buildBarberCanceledTemplate(reservation: Reservation): string {
  return `
    <h2>Reserva cancelada</h2>
    <p>Tenés una reserva cancelada.</p>
    <p>
      <strong>Cliente:</strong> $ ${this.getClientName(reservation)}<br>
      <strong>Servicio:</strong> ${reservation.service.name}<br>
      <strong>Fecha:</strong> ${reservation.date}<br>
      <strong>Hora:</strong> ${reservation.time}
      <strong>Local:</strong> ${reservation.location.name} - ${reservation.location.address}

    </p>
  `;
}
private getClientName(reservation: Reservation): string {
  return (
    reservation.client?.name ??
    reservation.guestName ??
    'Cliente'
  );
}

private async getAnyAvailableBarber(
  dto: CreateBookingDto,
): Promise<User> {

  const jsDate = new Date(dto.date + 'T00:00:00');
  const weekday = jsDate
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as DayOfWeek;

  // 1️⃣ Buscar disponibilidades activas ese día
  const availabilities = await this.barberAvailabilityRepository.find({
    where: {
      day_of_week: weekday,
      is_active: true,
    },
    relations: ['barber'],
  });

  if (!availabilities.length) {
    throw new BadRequestException(
      'No hay barberos disponibles ese día',
    );
  }

  // 2️⃣ Filtrar por rango horario
  const validAvailabilities = availabilities.filter(a =>
    dto.time >= a.start_time && dto.time < a.end_time,
  );

  if (!validAvailabilities.length) {
    throw new BadRequestException(
      'No hay barberos disponibles en ese horario',
    );
  }

  // 3️⃣ Excluir barberos ya reservados
  for (const availability of validAvailabilities) {
    const exists = await this.reservationRepository.findOne({
      where: {
        barber: { id: availability.barber.id },
        date: dto.date,
        time: dto.time,
      },
    });

    if (!exists) {
      return availability.barber;
    }
  }

  throw new BadRequestException(
    'No hay barberos libres en ese horario',
  );
}
async findMyReservations(clientId: number) {
  return this.reservationRepository.find({
    where: {
      client: { id: clientId },
    },
    relations: ['barber', 'service', 'location'],
    order: {
      date: 'ASC',
      time: 'ASC',
    },
  });
}

async completeReservation(reservationId: number) {
  const reservation = await this.reservationRepository.findOne({
    where: { id: reservationId },
    relations: ['client', 'barber', 'service', 'location'],
  });

  if (!reservation) {
    throw new NotFoundException('No se encontró la reserva');
  }

  if (reservation.status === ReservationStatus.COMPLETED) {
    throw new BadRequestException('La reserva ya fue marcada como atendida');
  }

  if (reservation.status !== ReservationStatus.CONFIRMED) {
    throw new BadRequestException(
      'Solo se pueden completar reservas confirmadas',
    );
  }

  reservation.status = ReservationStatus.COMPLETED;
  reservation.completedAt = new Date();

  const saved = await this.reservationRepository.save(reservation);

  return saved;
}
async markNoShow(reservationId: number) {
  const reservation = await this.reservationRepository.findOne({
    where: { id: reservationId },
  });

  if (!reservation) {
    throw new NotFoundException('No se encontró la reserva');
  }

  if (reservation.status !== ReservationStatus.CONFIRMED) {
    throw new BadRequestException(
      'Solo se puede marcar no-show una reserva confirmada',
    );
  }

  reservation.status = ReservationStatus.NO_SHOW;

  return this.reservationRepository.save(reservation);
}
async getTodayBookingsForBarber(barberId: number) {
  const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

  return this.reservationRepository.find({
    where: {
      barber: { id: barberId },
      date: today,
    },
    relations: ['client', 'service', 'location'],
    order: {
      time: 'ASC',
    },
  });
}
getBarberHistory(barberId: number) {
  return this.reservationRepository.find({
    where: {
      barber: { id: barberId },
      status: In(['completed', 'canceled', 'no_show']),
    },
    relations: ['client', 'service', 'location'],
    order: { date: 'DESC', time: 'DESC' },
  });
}
async createDirect(dto: CreateDirectBookingDto) {
  let client: User | null = null;

  if (dto.clientEmail) {
    client = await this.userRepository.findOne({
      where: { email: dto.clientEmail },
    });
  }

  if (!client && !dto.guestName) {
    throw new BadRequestException(
      'Debe indicar un cliente registrado o un nombre de cliente',
    );
  }

  const reservation = this.reservationRepository.create({
    barber: { id: dto.barberId },
    service: { id: dto.serviceId },
    location: { id: dto.locationId },
    date: dto.date,
    time: dto.time,
    client: client ?? undefined,
    guestName: client ? undefined : dto.guestName,
    status: ReservationStatus.COMPLETED,
    completedAt: new Date(),
  });

  return this.reservationRepository.save(reservation);
}
async getBookingsByDate(barberId: number, date: string) {
  return this.reservationRepository.find({
    where: {
      barber: { id: barberId },
      date,
    },
    relations: ['client', 'service', 'location'],
    order: {
      time: 'ASC',
    },
  });
}

}