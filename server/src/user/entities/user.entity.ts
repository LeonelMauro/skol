import { Role } from "src/roles/entities/role.entity";
import { Service } from "src/services/entities/service.entity";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { BarberAvailability } from "src/barber-availability/entities/barber-availability.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

 @Column({ type: 'date' })
 birthDate: string; // formato YYYY-MM-DD

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  // --- Relaciones para reservas ---

  // Reservas hechas por el cliente
  @OneToMany(() => Reservation, (reservation) => reservation.client)
  reservationsAsClient: Reservation[];

  // Reservas donde el usuario actúa como peluquero
  @OneToMany(() => Reservation, (reservation) => reservation.barber)
  reservationsAsBarber: Reservation[];

  // --- Disponibilidad del peluquero ---
  @OneToMany(() => BarberAvailability, (availability) => availability.barber)
  availabilities: BarberAvailability[];
}
