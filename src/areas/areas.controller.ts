import { Body, Controller, Get, Post, Req} from '@nestjs/common';
import type { Request } from 'express';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';

@Controller('areas')
export class AreasController{

 constructor(
  private readonly areasService:AreasService
 ){}


 @Post()
 create( 
  @Body() createAreaDto:CreateAreaDto,
  @Req() req:Request
 ){

  const user = req.user as any;

   return this.areasService.create(
      createAreaDto,
      user.cct
   );

 }


 @Get()
 findAll(
  @Req() req:Request
 ){
  const user = req.user as any;
   return this.areasService.findAll(
    user.cct
   );

 }

}