import {
 Injectable,
 NotFoundException
} from '@nestjs/common';

import {
 InjectRepository
} from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Reading } from '../readings/entities/readings.entity';
import { Sensor } from '../sensors/entities/sensors.entity';

@Injectable()
export class ReadingsService{

 constructor(

 @InjectRepository(Reading)
 private readingRepository:Repository<Reading>,

 @InjectRepository(Sensor)
 private sensorRepository:Repository<Sensor>

 ){}

 async register(sensorId:number){

   const sensor=
   await this.sensorRepository.findOne({

      where:{
        id:sensorId
      }

   });

   if(!sensor){

      throw new NotFoundException(
        'Sensor no encontrado'
      );

   }

   return await this.readingRepository.save({
      contenedor_id:
      sensor.contenedor_id,
      conteo:1
   });

 }

 async findAll(cct: string) {
  return await this.readingRepository
    .createQueryBuilder('reading')
    .innerJoinAndSelect('reading.container', 'container')
    .innerJoinAndSelect('container.area', 'area')
    .where('area.cct = :cct', { cct })
    .orderBy('reading.timestamp', 'DESC')
    .getMany();
}

}