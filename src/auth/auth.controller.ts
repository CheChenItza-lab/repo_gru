import { Body, Controller, Post, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {

 constructor(
   private readonly authService:AuthService
 ){}


 
 @Post('register')
 register(@Body() registerDto:RegisterDto){
   return this.authService.register(registerDto);}

 @Post('login')
 login(  @Body() loginDto:LoginDto ){
   return this.authService.login(loginDto);
 }

 @Get('confirm-email')
  confirmEmail(
    @Query('token') token: string,
  ) {
    return this.authService.confirmEmail(token);
  }

  @Post('forgot-password')
forgotPassword(
  @Body() forgotPasswordDto: ForgotPasswordDto,
) {
  return this.authService.forgotPassword(forgotPasswordDto);
}

@Post('reset-password')
resetPassword(
  @Body() resetPasswordDto: ResetPasswordDto,
) {
  return this.authService.resetPassword(resetPasswordDto);
}

@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(
  @Req() req: any,
) {
  return this.authService.getProfile(req.user.id);
}


}