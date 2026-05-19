import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { ReadingsService } from './readings.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('readings')
export class ReadingsController {
  constructor(
    private readonly readingsService: ReadingsService,
  ) {}

  @Post('register')
  register(
    @Body() createReadingDto: CreateReadingDto,
  ) {
    return this.readingsService.register(
      createReadingDto.sensorId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Req() req: Request,
  ) {
    const user = req.user as any;

    return this.readingsService.findAll(
      user.cct,
    );
  }
}