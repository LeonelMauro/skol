import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Entity()
export class Commission {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  barber: User;

  @Column('decimal', { precision: 5, scale: 2 })
  percentage: number; // ej: 60.00

}