import { Service } from "src/services/entities/service.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  NO_SHOW = 'no_show',
}


@Entity()
export class Reservation {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reservationsAsClient)
    client: User;

    @ManyToOne(() => User, (user) => user.reservationsAsBarber)
    barber: User;

    @ManyToOne(() => Service, (service) => service.reservations)
    service: Service;

    @Column()
    date: string; // yyyy-mm-dd

    @Column()
    time: string; // hh:mm

    @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
    })
    status: ReservationStatus;

}
