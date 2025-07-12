import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
    return {
      message: 'Account created successfully. Please verify your email.',
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Log into an existing account and receive a JWT token',
  })
  async login(@Body() dto: LoginDto) {
    const token = await this.authService.login(dto);
    return {
      token: token,
    };
  }

  @Post('confirm-email')
  @ApiOperation({ summary: 'Activate your account with the URL sent to email' })
  confirmEmail(@Body() body: any) {}

  @Post('guest-login')
  @ApiOperation({ summary: 'Receive a guest JWT token' })
  guestLogin() {
    this.authService.guestLogin();
  }
}
