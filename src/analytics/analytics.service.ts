import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Area } from '../areas/entities/areas.entity';
import { Reading } from 'src/readings/entities/readings.entity';
import { Container } from 'src/conteiners/entities/conteiners.entity';

@Injectable()
export class AnalyticsService {

  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,

    @InjectRepository(Container)
    private readonly containerRepository:Repository<Container>,

    @InjectRepository(Reading)
    private readonly readingRepository:Repository<Reading>
  ) {}

  async getDashboard(cct:string){

const areasActivas=
await this.areaRepository.count({
    where:{cct}
});


const residuoMasDesechado=
await this.readingRepository
.createQueryBuilder('l')

.innerJoin(
   'l.container',
   'c'
)

.innerJoin(
   'c.area',
   'a'
)

.select(
   'c.tipo',
   'tipo'
)

.addSelect(
   'SUM(l.conteo)',
   'total'
)

.where(
   'a.cct=:cct',
   {cct}
)

.groupBy(
   'c.tipo'
)

.orderBy(
   'total',
   'DESC'
)

.limit(1)

.getRawOne();

const generacionPorTipo =
await this.readingRepository
.createQueryBuilder('l')
.innerJoin('l.container', 'c')
.innerJoin('c.area', 'a')
.select('DAYNAME(l.timestamp)', 'dia')
.addSelect('c.tipo', 'tipo')
.addSelect('SUM(l.conteo)', 'total')
.where('a.cct = :cct', { cct })
.groupBy('dia')
.addGroupBy('c.tipo')
.orderBy('DAYNAME(l.timestamp)', 'ASC')
.getRawMany();

const distribucionPorArea =
await this.readingRepository
.createQueryBuilder('l')
.innerJoin('l.container', 'c')
.innerJoin('c.area', 'a')
.select('a.nombre', 'area')
.addSelect('a.color', 'color')
.addSelect('SUM(l.conteo)', 'total')
.where('a.cct = :cct', { cct })
.groupBy('a.id')
.addGroupBy('a.nombre')
.addGroupBy('a.color')
.orderBy('total', 'DESC')
.getRawMany();

const registrosRecientes =
await this.readingRepository
.createQueryBuilder('l')
.innerJoin('l.container', 'c')
.innerJoin('c.area', 'a')
.select('l.id', 'id')
.addSelect('c.tipo', 'tipo')
.addSelect('a.nombre', 'area')
.addSelect('l.timestamp', 'fecha')
.addSelect('l.conteo', 'conteo')
.where('a.cct = :cct', { cct })
.orderBy('l.timestamp', 'DESC')
.limit(10)
.getRawMany();




return{

   areasActivas,

   residuoMasDesechado,

   generacionPorTipo,

   distribucionPorArea,

   registrosRecientes

};
}

async getSummary(cct: string) {

  const totalResiduos =
  await this.readingRepository
  .createQueryBuilder('l')
  .innerJoin('l.container', 'c')
  .innerJoin('c.area', 'a')
  .select('SUM(l.conteo)', 'total')
  .where('a.cct = :cct', { cct })
  .getRawOne();

  const areasActivas =
  await this.areaRepository.count({
    where: { cct },
  });

  return {
    totalResiduos: Number(totalResiduos.total) || 0,
    areasActivas,
  };
}

async getByArea(cct: string) {

  const data =
  await this.readingRepository
  .createQueryBuilder('l')
  .innerJoin('l.container', 'c')
  .innerJoin('c.area', 'a')
  .select('a.id', 'areaId')
  .addSelect('a.nombre', 'area')
  .addSelect('a.color', 'color')
  .addSelect('SUM(l.conteo)', 'total')
  .where('a.cct = :cct', { cct })
  .groupBy('a.id')
  .addGroupBy('a.nombre')
  .addGroupBy('a.color')
  .orderBy('total', 'DESC')
  .getRawMany();

  return data.map(item => ({
    areaId: Number(item.areaId),
    area: item.area,
    color: item.color,
    total: Number(item.total),
  }));
}

async getByType(cct: string) {

  const data =
  await this.readingRepository
  .createQueryBuilder('l')
  .innerJoin('l.container', 'c')
  .innerJoin('c.area', 'a')
  .select('c.tipo', 'tipo')
  .addSelect('SUM(l.conteo)', 'total')
  .where('a.cct = :cct', { cct })
  .groupBy('c.tipo')
  .orderBy('total', 'DESC')
  .getRawMany();

  return data.map(item => ({
    tipo: item.tipo,
    total: Number(item.total),
  }));
}

async getTrend(cct: string) {

  const data =
  await this.readingRepository
  .createQueryBuilder('l')
  .innerJoin('l.container', 'c')
  .innerJoin('c.area', 'a')
  .select('YEAR(l.timestamp)', 'anio')
  .addSelect('MONTH(l.timestamp)', 'mes')
  .addSelect('SUM(l.conteo)', 'total')
  .where('a.cct = :cct', { cct })
  .groupBy('anio')
  .addGroupBy('mes')
  .orderBy('anio', 'ASC')
  .addOrderBy('mes', 'ASC')
  .getRawMany();

  return data.map(item => ({
    anio: Number(item.anio),
    mes: Number(item.mes),
    total: Number(item.total),
  }));
}
}