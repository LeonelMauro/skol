import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { User } from "src/user/entities/user.entity";
import { Location } from "src/location/entities/location.entity";
import { PaymentMethod } from "../enums/payment-method.enum";

@Entity()
export class Payment {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Reservation, { nullable: false })
  @JoinColumn() // 🔥 importante: este lado tiene la FK
  reservation: Reservation;

  @ManyToOne(() => User, { nullable: false })
  barber: User;

  @ManyToOne(() => Location, { nullable: false })
  location: Location;

  @Column('decimal', { precision: 10, scale: 2 })
  servicePrice: number;

  @Column('decimal', { precision: 5, scale: 2 })
  commissionPercentage: number;

  @Column('decimal', { precision: 10, scale: 2 })
  barberEarning: number;

  @Column('decimal', { precision: 10, scale: 2 })
  shopEarning: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paidAt: Date;
}