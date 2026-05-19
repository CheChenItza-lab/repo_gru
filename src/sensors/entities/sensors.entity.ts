import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Container } from '../../conteiners/entities/conteiners.entity';

@Entity('sensores')
export class Sensor {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: true,
  })
  nombre!: string;

  @Column({
    default: true,
  })
  activo!: boolean;

  /*
    FK
  */

  @Column()
  contenedor_id!: number;

  /*
    RELACIÓN
  */

  @ManyToOne(
    () => Container,
    (container) => container.sensors,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'contenedor_id',
  })
  container!: Container;
}