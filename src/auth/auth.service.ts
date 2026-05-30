import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

import { User } from 'src/users/entities/users.entity';
import { School } from 'src/schools/entities/schools.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Resend } from 'resend';

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


const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
const activationLink = `${backendUrl}/auth/confirm-email?token=${activationToken}`;

await this.sendEmail(
  user.email,
  'Confirma tu cuenta',
  `
    <h2>Confirma tu cuenta</h2>
    <p>Haz clic en el siguiente enlace para activar tu cuenta:</p>
    <a href="${activationLink}">Activar cuenta</a>
  `,
);


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

async forgotPassword(
  forgotPasswordDto: ForgotPasswordDto,
) {
  const { email } = forgotPasswordDto;

  const user = await this.userRepository.findOne({
    where: { email },
  });

  if (!user) {
    return {
      message: 'Si el correo existe, se enviará un enlace de recuperación.',
    };
  }

  const resetToken = randomBytes(32).toString('hex');

  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 1);

  user.reset_password_token = resetToken;
  user.reset_password_expires = expirationDate;

  await this.userRepository.save(user);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  await this.sendEmail(
  user.email,
  'Recuperación de contraseña',
  `
    <h2>Recuperación de contraseña</h2>
    <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
    <a href="${resetLink}">Restablecer contraseña</a>
    <p>Este enlace expira en 1 hora.</p>
  `,
);

  return {
    message: 'Si el correo existe, se enviará un enlace de recuperación.',
  };
}

async resetPassword(
  resetPasswordDto: ResetPasswordDto,
) {
  const { token, newPassword } = resetPasswordDto;

  const user = await this.userRepository.findOne({
    where: {
      reset_password_token: token,
    },
  });

  if (!user) {
    throw new BadRequestException('Token inválido');
  }

  if (
    user.reset_password_expires &&
    user.reset_password_expires < new Date()
  ) {
    throw new BadRequestException('El token ha expirado');
  }

  user.password = newPassword;
  user.reset_password_token = null;
  user.reset_password_expires = null;

  await this.userRepository.save(user);

  return {
    message: 'Contraseña actualizada correctamente',
  };
}

async getProfile(userId: number) {
  const user = await this.userRepository.findOne({
    where: {
      id: userId,
    },
    relations: ['school'],
  });

  if (!user) {
    throw new UnauthorizedException('Usuario no encontrado');
  }

  return {
    id: user.id,
    email: user.email,
    cct: user.cct,
    school: user.school,
  };
}

private getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY no está configurada');
  }

  return new Resend(apiKey);
}

private async sendEmail(
  to: string,
  subject: string,
  html: string,
) {
  const resend = this.getResendClient();

  const from = process.env.MAIL_FROM || 'GRU <onboarding@resend.dev>';

  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  console.log('Correo enviado con Resend:', result.data?.id);

  return result;
}

}
