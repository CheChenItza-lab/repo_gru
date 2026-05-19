import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

import { Area } from '../areas/entities/areas.entity';
import { Container } from '../conteiners/entities/conteiners.entity';
import { Reading } from '../readings/entities/readings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Area,
      Container,
      Reading,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}