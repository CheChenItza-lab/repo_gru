import { Module } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { ReadingsController } from './readings.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Reading } from './entities/readings.entity';
import { Sensor } from 'src/sensors/entities/sensors.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reading, Sensor]),
  ],
  providers: [ReadingsService],
  controllers: [ReadingsController]
})
export class ReadingsModule {}
