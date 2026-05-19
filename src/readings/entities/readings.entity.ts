import {  Column,
  CreateDateColumn,  Entity,  Index,  JoinColumn,  ManyToOne,  PrimaryGeneratedColumn,} from 'typeorm';
import { Container } from '../../conteiners/entities/conteiners.entity';

@Entity('lecturas')
export class Reading {

  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({    default: 1,})
  conteo!: number;

  /*   TIMESTAMP AUTOMÁTICO  */
  @Index()
  @CreateDateColumn()
  timestamp!: Date;

  /*    FK  */
  @Column()
  contenedor_id!: number;

  /*    RELACIÓN  */
  @ManyToOne(
    () => Container,
    (container) => container.readings,
    {
      onDelete: 'CASCADE',    },)
  @JoinColumn({
    name: 'contenedor_id',})
  container!: Container;
}