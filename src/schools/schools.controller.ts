import {
 Body,
 Controller,
 Get,
 Param,
 Post
} from '@nestjs/common';

import { SchoolsService } from './schools.service';

import { CreateSchoolDto } from './dto/create-school.dto';

@Controller('schools')
export class SchoolsController {

     constructor(
        private readonly schoolsService:SchoolsService
            ){}

    @Post()
    create(
    @Body()
    createSchoolDto:CreateSchoolDto
    ){
        return this.schoolsService.create(
        createSchoolDto
    );
    }

    @Get()
    findAll(){

   return this.schoolsService.findAll();

 }

 @Get(':cct')
 findOne(
   @Param('cct')
   cct:string
 ){

   return this.schoolsService.findOne(
      cct
   );

 }

}