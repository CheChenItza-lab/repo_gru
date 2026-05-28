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

async getHistory(filters: {
  cct: string;
  page: number;
  limit: number;
  start?: string;
  end?: string;
  type?: string;
  areaId?: number;
}) {
  const {
    cct,
    page,
    limit,
    start,
    end,
    type,
    areaId,
  } = filters;

  const currentPage = page > 0 ? page : 1;
  const currentLimit = limit > 0 ? limit : 20;
  const skip = (currentPage - 1) * currentLimit;

  const query = this.readingRepository
    .createQueryBuilder('l')
    .innerJoin('l.container', 'c')
    .innerJoin('c.area', 'a')
    .select('l.id', 'id')
    .addSelect('c.tipo', 'tipo')
    .addSelect('a.id', 'areaId')
    .addSelect('a.nombre', 'area')
    .addSelect('l.conteo', 'conteo')
    .addSelect('l.timestamp', 'fecha')
    .where('a.cct = :cct', { cct });

  if (start) {
    const startDate = new Date(start);
    query.andWhere('l.timestamp >= :startDate', {
      startDate,
    });
  }

  if (end) {
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    query.andWhere('l.timestamp <= :endDate', {
      endDate,
    });
  }

  if (type) {
    query.andWhere('c.tipo = :type', {
      type,
    });
  }

  if (areaId) {
    query.andWhere('a.id = :areaId', {
      areaId,
    });
  }

  const total = await query.getCount();

  const data = await query
    .orderBy('l.timestamp', 'DESC')
    .offset(skip)
    .limit(currentLimit)
    .getRawMany();

  return {
    data: data.map((item) => ({
      id: Number(item.id),
      tipo: item.tipo,
      areaId: Number(item.areaId),
      area: item.area,
      conteo: Number(item.conteo),
      fecha: item.fecha,
    })),
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages: Math.ceil(total / currentLimit),
  };
}

}