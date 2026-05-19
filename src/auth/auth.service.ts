import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

import { User } from 'src/users/entities/users.entity';
import { School } from 'src/schools/entities/schools.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

 constructor(
  private readonly configService: ConfigService,

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


const activationToken = randomBytes(32).toString('hex');

const expirationDate = new Date();
expirationDate.setHours(expirationDate.getHours() + 24);

const user = this.userRepository.create({
  email,
  password,
  cct,
  activo: false,
  activation_token: activationToken,
  activation_token_expires: expirationDate,
});

await this.userRepository.save(user);


const activationLink = `http://localhost:3000/auth/confirm-email?token=${activationToken}`;

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

await transporter.sendMail({
  from: `"GIRU" <${process.env.MAIL_USER}>`,
  to: user.email,
  subject: 'Confirma tu cuenta',
  html: `
    <h2>Confirma tu cuenta</h2>
    <p>Haz clic en el siguiente enlace para activar tu cuenta:</p>
    <a href="${activationLink}">Activar cuenta</a>
  `,
});


    return{

      message:'Usuario registrado'

    };

 }



 async login(loginDto: LoginDto) {

  const { email, password } = loginDto;

  const user = await this.userRepository
    .createQueryBuilder('user')
    .addSelect('user.password')
    .addSelect('user.activo')
    .where('user.email=:email', { email })
    .getOne();

  if (!user)
    throw new UnauthorizedException(
      'Credenciales inválidas'
    );

  const validPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!validPassword)
    throw new UnauthorizedException(
      'Credenciales inválidas'
    );

  if (!user.activo)
    throw new UnauthorizedException(
      'Debes confirmar tu correo electrónico'
    );

  const payload = {
    sub: user.id,
    email: user.email,
    cct: user.cct
  };

  return {
    token: this.jwtService.sign(payload)
  };

}

async confirmEmail(token: string) {

  const user = await this.userRepository.findOne({
    where: {
      activation_token: token,
    },
  });

  if (!user) {
    throw new BadRequestException('Token inválido');
  }

  if (
    user.activation_token_expires &&
    user.activation_token_expires < new Date()
  ) {
    throw new BadRequestException('El token ha expirado');
  }

  user.activo = true;
  user.fecha_activacion = new Date();
  user.activation_token = null;
  user.activation_token_expires = null;

  await this.userRepository.save(user);

  return {
    message: 'Cuenta activada correctamente',
  };
}

}
