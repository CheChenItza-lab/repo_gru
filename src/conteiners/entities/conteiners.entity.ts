import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Area } from '../../areas/entities/areas.entity';
import { Sensor } from '../../sensors/entities/sensors.entity';
import { Reading } from '../../readings/entities/readings.entity';

import { ContainerType } from '../enums/conteiner-type.enum';

@Entity('contenedores')
export class Container {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: ContainerType,
  })
  tipo!: ContainerType;

  @Column({
    default: 100,
  })
  capacidad_max!: number;

  /*
    FK
  */

  @Column()
  area_id!: number;

  /*
    RELACIONES
  */

  @ManyToOne(
    () => Area,
    (area) => area.containers,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'area_id',
  })
  area!: Area;

  @OneToMany(
    () => Sensor,
    (sensor) => sensor.container,
  )
  sensors!: Sensor[];

  @OneToMany(
    () => Reading,
    (reading) => reading.container,
  )
  readings!: Reading[];
}