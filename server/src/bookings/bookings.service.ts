import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BarberAvailability } from 'src/barber-availability/entities/barber-availability.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Service } from 'src/services/entities/service.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

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
}
