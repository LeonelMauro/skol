import { Role } from "src/roles/entities/role.entity";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { BarberAvailability } from "src/barber-availability/entities/barber-availability.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Location } from "src/location/entities/location.entity";

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

  @Column({ nullable: true })
  phone: string;


  @Column({ type: 'date' })
  birthDate: string; // formato YYYY-MM-DD

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  // Reservas hechas por el cliente
  @OneToMany(() => Reservation, (reservation) => reservation.client)
  reservationsAsClient: Reservation[];

  // Reservas donde el usuario actúa como peluquero
  @OneToMany(() => Reservation, (reservation) => reservation.barber)
  reservationsAsBarber: Reservation[];

  // --- Disponibilidad del peluquero ---
  @OneToMany(() => BarberAvailability, (availability) => availability.barber)
  availabilities: BarberAvailability[];

  @ManyToOne(() => Location, location => location.barbers, { nullable: true })
  location: Location;

}
