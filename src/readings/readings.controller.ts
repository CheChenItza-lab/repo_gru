import {
  Body,
  Controller,
  Get,
  Post,
  Query,
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

  @Get('history')
@UseGuards(JwtAuthGuard)
getHistory(
  @Req() req: any,
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '20',
  @Query('start') start?: string,
  @Query('end') end?: string,
  @Query('type') type?: string,
  @Query('areaId') areaId?: string,
) {
  return this.readingsService.getHistory({
    cct: req.user.cct,
    page: Number(page),
    limit: Number(limit),
    start,
    end,
    type,
    areaId: areaId ? Number(areaId) : undefined,
  });
}
}