import { Module } from '@nestjs/common';
import { ConteinersController } from './conteiners.controller';
import { ConteinersService } from './conteiners.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Container } from './entities/conteiners.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Container]),
  ],
  controllers: [ConteinersController],
  providers: [ConteinersService]
})
export class ConteinersModule {}
