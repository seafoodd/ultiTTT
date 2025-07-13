import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { EmailService } from '@/modules/email/email.service';
import { ResendVerificationEmailDto } from '@/modules/auth/dto/resend-verification-email.dto';
import { EnvConfig } from '@/core/config/env.config';
import { DisposableEmailService } from '@/core/disposable-email/disposable-email.service';
import { isEmailTokenPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private envConfig: EnvConfig,
    private emailService: EmailService,
    private readonly disposableEmailService: DisposableEmailService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  private get jwtSecret(): string {
    return this.envConfig.getEnvVarOrThrow('ACCESS_TOKEN_SECRET');
  }

  async register(dto: RegisterDto) {
    const { email, username, password } = dto;

    if (
      this.envConfig.isProduction &&
      this.disposableEmailService.isDisposable(email)
    ) {
      throw new BadRequestException('Invalid email');
    }

    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Email is already taken');
    }
    if (await this.prisma.user.findUnique({ where: { username } })) {
      throw new ConflictException('Username is already taken');
    }

    const hashed = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: {
        username,
        displayName: username,
        email,
        password: hashed,
        socials: { create: {} },
        perfs: {
          create: {
            bullet: { create: {} },
            blitz: { create: {} },
            rapid: { create: {} },
            standard: { create: {} },
          },
        },
        profile: { create: {} },
      },
    });

    const token = jwt.sign(
      { identifier: username, t: 'verify-email' },
      this.jwtSecret,
      { expiresIn: '24h' },
    );

    try {
      await this.emailService.sendVerificationEmail(username, email, token);
    } catch (e) {
      this.logger.error('Failed to send verification email', e);
    }
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    const { identifier, password, rememberMe } = dto;

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
    if (!user) throw new UnauthorizedException('Invalid username or password');
    if (!user.verified)
      throw new ForbiddenException('Please confirm your email');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      throw new UnauthorizedException('Invalid username or password');

    const token = jwt.sign(
      { identifier, role: 'user' },
      this.jwtSecret,
      rememberMe ? undefined : { expiresIn: '7d' },
    );

    return { token };
  }

  async resendVerificationEmail(dto: ResendVerificationEmailDto) {
    const { email } = dto;
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user || user.verified) {
      // silent return to avoid enumeration
      return;
    }

    const { username } = user;

    const token = jwt.sign({ username, role: 'user' }, this.jwtSecret, {
      expiresIn: '7d',
    });

    try {
      await this.emailService.sendVerificationEmail(
        user.username,
        email,
        token,
      );
    } catch (e) {
      this.logger.error('Failed to send verification email', e);
    }
  }

  guestLogin(): { token: string } {
    const id = nanoid();
    const token = jwt.sign({ identifier: id, role: 'guest' }, this.jwtSecret, {
      expiresIn: '24h',
    });
    return { token };
  }

  async confirmEmail(
    authHeader: string,
  ): Promise<{ message: string; token: string }> {
    const token = authHeader.replace(/^Bearer\s+/, '');
    let payload: unknown;
    try {
      payload = jwt.verify(token, this.jwtSecret);
    } catch (e: unknown) {
      if (e instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Confirmation link expired');
      }
      throw new UnauthorizedException('Invalid confirmation link');
    }
    if (!isEmailTokenPayload(payload)) {
      throw new UnauthorizedException('Invalid confirmation link');
    }

    const dbUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: payload.identifier }, { username: payload.identifier }],
      },
    });
    if (!dbUser) throw new UnauthorizedException('Invalid confirmation link');
    if (dbUser.verified) throw new ConflictException('Email already verified');

    await this.prisma.user.update({
      where: { username: payload.identifier },
      data: { verified: true },
    });

    const authToken = jwt.sign(
      { identifier: payload.identifier, role: 'user' },
      this.jwtSecret,
      { expiresIn: '7d' },
    );
    return { message: 'Email successfully verified', token: authToken };
  }
}
