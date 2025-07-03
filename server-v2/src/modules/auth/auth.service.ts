import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { EmailService } from '@/modules/email/email.service';

// import {
//   preventAccountFlooding,
//   preventBruteforce,
// } from '../helpers/rate-limiting.helpers';
// import {
//   disposableDomainsSet,
//   sendVerificationEmail,
// } from '../helpers/email.helpers';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  private get jwtSecret() {
    const secret = this.config.get<string>('ACCESS_TOKEN_SECRET');
    if (!secret) {
      throw new Error('JWT secret is not defined in configuration');
    }
    return secret;
  }

  async register(dto: RegisterDto) {
    const { email, username, password } = dto;

    // email domain/disposable check
    // const domain = email.split('@')[1].toLowerCase().trim();
    // if (disposableDomainsSet.has(domain)) {
    //   throw new BadRequestException('Invalid email domain');
    // }

    // rate-limit
    // const floodRetry = await preventAccountFlooding();
    // if (floodRetry)
    //   throw new ForbiddenException(
    //     `Too many requests, retry after ${floodRetry}`,
    //   );

    // unique checks
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

    await this.emailService.sendVerificationEmail(username, email, token);
  }

  async login(dto: LoginDto): Promise<string> {
    const { identifier, password, rememberMe } = dto;

    // rate-limit
    // const bruteRetry = await preventBruteforce(/* you can pass IP here */);
    // if (bruteRetry)
    //   throw new ForbiddenException(
    //     `Too many requests, retry after ${bruteRetry}`,
    //   );

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
    if (!user) throw new UnauthorizedException('Invalid username or password');
    if (!user.verified)
      throw new ForbiddenException('Please confirm your email');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      throw new UnauthorizedException('Invalid username or password');

    return jwt.sign(
      { identifier, role: 'user' },
      this.jwtSecret,
      rememberMe ? undefined : { expiresIn: '7d' },
    );
  }

  guestLogin(): string {
    const id = nanoid();
    return jwt.sign({ identifier: id, role: 'guest' }, this.jwtSecret, {
      expiresIn: '24h',
    });
  }

  async confirmEmail(
    header: string,
  ): Promise<{ message: string; token: string }> {
    const token = header.replace(/^Bearer\s+/, '');
    let payload: any;
    try {
      payload = jwt.verify(token, this.jwtSecret);
    } catch (e: any) {
      if (e.name === 'TokenExpiredError')
        throw new UnauthorizedException('Confirmation link expired');
      throw new UnauthorizedException('Invalid confirmation link');
    }
    if (payload.t !== 'verify-email') {
      throw new UnauthorizedException('Invalid confirmation token');
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
