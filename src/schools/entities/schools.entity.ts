import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { User } from '../../users/entities/users.entity';
import { Area } from '../../areas/entities/areas.entity';

@Entity('escuelas')
export class School {

  @PrimaryColumn({
    length: 10,
  })
  cct!: string;

  @Column({
    length: 255,
  })
  nombre!: string;

  /*
    RELACIONES
  */

  @OneToMany(
    () => User,
    (user) => user.school,
  )
  users!: User[];

  @OneToMany(
    () => Area,
    (area) => area.school,
  )
  areas!: Area[];
}