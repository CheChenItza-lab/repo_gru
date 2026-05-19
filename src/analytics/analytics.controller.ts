import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {

  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('dashboard')
  getDashboard(
    @Req() req: any,
  ) {
    return this.analyticsService.getDashboard(
      req.user.cct,
    );
  }

  @Get('summary')
getSummary(
  @Req() req: any,
) {
  return this.analyticsService.getSummary(
    req.user.cct,
  );
}

@Get('by-area')
getByArea(
  @Req() req: any,
) {
  return this.analyticsService.getByArea(
    req.user.cct,
  );
}

@Get('by-type')
getByType(
  @Req() req: any,
) {
  return this.analyticsService.getByType(
    req.user.cct,
  );
}

@Get('trend')
getTrend(
  @Req() req: any,
) {
  return this.analyticsService.getTrend(
    req.user.cct,
  );
}
}