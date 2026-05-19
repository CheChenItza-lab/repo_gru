import {
 IsEmail,
 IsNotEmpty,
 IsString,
 MinLength,
 Matches
} from 'class-validator';

export class RegisterDto {

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{10}$/)
  cct!: string;

}