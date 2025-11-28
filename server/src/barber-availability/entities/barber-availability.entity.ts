import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Entity()
export class BarberAvailability {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.availabilities, { eager: true })
  barber: User;

  @Column()
  day_of_week: string; // monday - sunday

  @Column()
  start_time: string; // "09:00"

  @Column()
  end_time: string;   // "13:00"

  @Column({ default: true })
  is_active: boolean;
}
