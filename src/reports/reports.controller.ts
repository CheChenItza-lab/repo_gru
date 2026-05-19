import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Res } from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {

  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Get()
  generateReport(
    @Query('start') start: string,
    @Query('end') end: string,
    @Req() req: any,
  ) {
    return this.reportsService.generateReport(
      req.user.cct,
      start,
      end,
    );
  }

  @Get('pdf')
generatePdfReport(
  @Query('start') start: string,
  @Query('end') end: string,
  @Req() req: any,
  @Res() res: Response,
) {
  return this.reportsService.generatePdfReport(
    req.user.cct,
    start,
    end,
    res,
  );
}
}