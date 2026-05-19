import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

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
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}