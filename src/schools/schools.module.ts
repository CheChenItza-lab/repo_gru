import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';

import { School } from './entities/schools.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([School]),
  ],
  providers: [SchoolsService],
  controllers: [SchoolsController]
})
export class SchoolsModule {}
