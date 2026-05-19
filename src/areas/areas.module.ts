import { Module } from '@nestjs/common';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/areas.entity';
import { Container } from 'src/conteiners/entities/conteiners.entity';
import { Sensor } from 'src/sensors/entities/sensors.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Area, Container, Sensor]),
  ],
  providers: [AreasService],
  controllers: [AreasController]
})
export class AreasModule {}
