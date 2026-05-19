import {
 BadRequestException,
 Injectable,
 UnauthorizedException
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { User } from 'src/users/entities/users.entity';
import { School } from 'src/schools/entities/schools.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

 constructor(

   @InjectRepository(User)
   private readonly userRepository:Repository<User>,

   @InjectRepository(School)
   private readonly schoolRepository:Repository<School>,

   private readonly jwtService:JwtService

 ){}



 async register(registerDto:RegisterDto){

    const {email,password,cct}=registerDto;

    const school=await this.schoolRepository.findOne({
      where:{cct}
    });

    if(!school)
      throw new BadRequestException(
       'Escuela no encontrada'
      );


    const existingUser=
    await this.userRepository.findOne({

      where:{email}

    });

    if(existingUser)
      throw new BadRequestException(
        'Correo ya registrado'
      );


    const user=this.userRepository.create({

      email,
      password,
      cct

    });


    await this.userRepository.save(user);


    return{

      message:'Usuario registrado'

    };

 }



 async login(loginDto:LoginDto){

    const {email,password}=loginDto;

    const user=
    await this.userRepository
    .createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.email=:email',{
      email
    })
    .getOne();


    if(!user)
      throw new UnauthorizedException(
        'Credenciales inválidas'
      );


   const validPassword=
   await bcrypt.compare(
      password,
      user.password
   );

   if(!validPassword)
      throw new UnauthorizedException(
        'Credenciales inválidas'
      );


   const payload={

      sub:user.id,
      email:user.email,
      cct:user.cct

   };


   return{

      token:
      this.jwtService.sign(payload)

   };

 }

}
