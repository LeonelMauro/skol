import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from "typeorm";
import { Location } from "src/location/entities/location.entity";

@Entity()
@Index(['location', 'date'], { unique: true }) // un cierre por día por sucursal
export class CashClosure {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Location, { nullable: false })
  location: Location;

  @Column({ type: 'date' })
  date: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalCash: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalMercadoPago: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalRevenue: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  closedAt: Date;
}