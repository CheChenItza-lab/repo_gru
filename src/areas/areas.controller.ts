import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('areas')
export class AreasController {
  constructor(
    private readonly areasService: AreasService,
  ) {}

  @Post()
  create(
    @Body() createAreaDto: CreateAreaDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    return this.areasService.create(
      createAreaDto,
      user.cct,
    );
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as any;

    return this.areasService.findAll(
      user.cct,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    return this.areasService.findOne(
      Number(id),
      user.cct,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAreaDto: UpdateAreaDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    return this.areasService.update(
      Number(id),
      user.cct,
      updateAreaDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    return this.areasService.remove(
      Number(id),
      user.cct,
    );
  }
}