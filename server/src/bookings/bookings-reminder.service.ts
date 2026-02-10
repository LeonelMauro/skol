import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from 'src/reservation/entities/reservation.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class BookingsReminderService {
  private readonly logger = new Logger(BookingsReminderService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly mailService: MailService,
  ) {}

  @Cron('*/5 * * * *') // cada 5 minutos
  async sendReminders() {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 10 * 60 * 1000);

    const reservations = await this.reservationRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.client', 'client')
      .leftJoinAndSelect('r.barber', 'barber')
      .leftJoinAndSelect('r.service', 'service')
      .where('r.status = :status', { status: ReservationStatus.CONFIRMED })
      .andWhere('r.reminderSent = false')
      .andWhere(
        `(r.date || ' ' || r.time)::timestamp BETWEEN :from AND :to`,
        { from: now, to: twoHoursLater },
      )
      .getMany();

    for (const reservation of reservations) {
      if (!reservation.client?.email) {
        return;
      }
      try {
        await this.mailService.sendMail(
          
          reservation.client.email,
          'Recordatorio de tu reserva - Skol Barbería',
          `
            <h2>Recordatorio de reserva</h2>
            <p>Hola ${reservation.client.name},</p>
            <p>Este es un recordatorio de tu turno.</p>
            <p>
              <strong>Barbero:</strong> ${reservation.barber.name}<br>
              <strong>Servicio:</strong> ${reservation.service.name}<br>
              <strong>Fecha:</strong> ${reservation.date}<br>
              <strong>Hora:</strong> ${reservation.time}
            </p>
          `,
        );

        reservation.reminderSent = true;
        await this.reservationRepository.save(reservation);

        this.logger.log(`Recordatorio enviado (reserva ${reservation.id})`);
      } catch (error) {
        this.logger.error(
          `Error enviando recordatorio (reserva ${reservation.id})`,
          error.stack,
        );
      }
    }
  }
}
