import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import * as bcrypt from 'bcrypt';

import { School } from '../../schools/entities/schools.entity';

@Entity('usuarios')
export class User {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    length: 255,
  })
  email!: string;

  @Column({
    select: false,
  })
  password!: string;

  @Column({
    default: false,
  })
  activo!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  fecha_activacion!: Date;

  /*
    FOREIGN KEY
  */

  @Column()
  cct!: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
activation_token!: string | null;

@Column({
  type: 'timestamp',
  nullable: true,
})
activation_token_expires!: Date | null;

  /*
    RELACIÓN
  */

  @ManyToOne(
    () => School,
    (school) => school.users,
  )
  @JoinColumn({
    name: 'cct',
  })
  school!: School;

  /*
    HASH PASSWORD
  */

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {

    if (!this.password) return;

    this.password = await bcrypt.hash(this.password, 10);
  }
}