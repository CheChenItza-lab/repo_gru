import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { School } from '../../schools/entities/schools.entity';
import { Container } from '../../conteiners/entities/conteiners.entity';

@Entity('areas')
export class Area {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    length: 100,
  })
  nombre!: string;

  @Column({
    default: true,
  })
  tiene_contenedores!: boolean;

  @Column({
    nullable: true,
  })
  responsable_nombre!: string;

  @Column({
    length: 20,
    nullable: true,
  })
  color!: string;

  /*
    FK
  */

  @Column()
  cct!: string;

  /*
    RELACIONES
  */

  @ManyToOne(
    () => School,
    (school) => school.areas,
  )
  @JoinColumn({
    name: 'cct',
  })
  school!: School;

  @OneToMany(
    () => Container,
    (container) => container.area,
  )
  containers!: Container[];
}