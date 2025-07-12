import {
  Controller,
  Post,
  Body,
  NotImplementedException,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { ResendVerificationEmailDto } from '@/modules/auth/dto/resend-verification-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new account',
    description:
      'Creates a new user account with email, username, and password.',
  })
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
    return {
      message: 'Account created successfully. Please verify your email.',
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Log into an existing account and receive a JWT token',
    description:
      'Authenticates user by email or username and password, returns a JWT token for authorization.',
  })
  async login(@Body() dto: LoginDto) {
    const token = await this.authService.login(dto);
    return {
      token: token,
    };
  }

  @Post('resend-verification-email')
  @ApiOperation({
    summary: 'Resend verification email',
    description:
      "Sends a verification email again if the email is registered, helps users who didn't receive the first email.",
  })
  async resendVerificationEmail(@Body() dto: ResendVerificationEmailDto) {
    await this.authService.resendVerificationEmail(dto);
    return { message: 'Verification email resent if the email is registered.' };
  }

  @Post('confirm-email')
  @ApiOperation({
    summary: 'Activate your account with the URL sent to email',
    description:
      'Verifies the user’s email by processing the token sent to their inbox to activate the account.',
  })
  confirmEmail(@Body() body: any) {
    throw new NotImplementedException();
  }

  @Post('guest-login')
  @ApiOperation({
    summary: 'Receive a guest JWT token',
    description:
      'Provides a guest access token without requiring registration for temporary usage.',
  })
  guestLogin() {
    this.authService.guestLogin();
  }
}
