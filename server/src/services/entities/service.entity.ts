import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Reservation } from "src/reservation/entities/reservation.entity";

@Entity()
export class Service {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
    
  @Column()
  description: string;

  @Column()
  price: number;

  @Column({
  type: 'varchar',
  length: 30,
  default: 'SCISSORS',
  })
  icon: string;


  @Column()
  duration_minutes: number;
  
  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Reservation, (reservation) => reservation.service)
  reservations: Reservation[];
}
