import {
 BadRequestException,
 Injectable
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { School } from './entities/schools.entity';

import { CreateSchoolDto } from './dto/create-school.dto';

@Injectable()
export class SchoolsService {

 constructor(

   @InjectRepository(School)
   private schoolRepository:Repository<School>

 ){}

 async create(
   createSchoolDto:CreateSchoolDto
 ){

   const {cct}=createSchoolDto;

   const school=
   await this.schoolRepository.findOne({
      where:{cct}
   });

   if(school)
      throw new BadRequestException(
         'La escuela ya existe'
      );

   return await this.schoolRepository.save(
      createSchoolDto
   );

 }

 async findAll(){

   return this.schoolRepository.find();

 }

 async findOne(cct:string){

   return this.schoolRepository.findOne({
      where:{cct}
   });

 }

}