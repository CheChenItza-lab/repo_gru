import {
 Body,
 Controller,
 Post
} from '@nestjs/common';

import { ReadingsService } from './readings.service';

import { CreateReadingDto } from './dto/create-reading.dto';

@Controller('readings')
export class ReadingsController{

 constructor(
   private readonly readingsService:ReadingsService
 ){}

 @Post('register')
 register(

 @Body()
 createReadingDto:CreateReadingDto

 ){

   return this.readingsService.register(
      createReadingDto.sensorId
   );

 }

}