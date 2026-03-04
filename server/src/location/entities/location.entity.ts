// src/location/entities/location.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { CashClosure } from 'src/cash-closure/entities/cash-closure.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Ej: "Skol Centro"

  @Column()
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  department: string; // NUEVO: para mayor precisión en la ubicación

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  imageUrl: string; // URL de la imagen


  @OneToMany(() => User, user => user.location)
  barbers: User[];

  @OneToMany(() => Reservation, reservation => reservation.location)
  reservations: Reservation[];

  @OneToMany(() => CashClosure, (closure) => closure.location)
  cashClosures: CashClosure[];
}
