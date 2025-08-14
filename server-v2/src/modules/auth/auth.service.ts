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
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { EmailService } from '@/modules/email/email.service';
import { ResendVerificationEmailDto } from '@/modules/auth/dto/resend-verification-email.dto';
import { isEmailTokenPayload, UserTokenPayload } from './auth.types';
import { UserService } from '@/modules/user/user.service';
import { UserRoles } from '@/shared/enums/user-roles';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {}

    private readonly _logger = new Logger(AuthService.name);

    async register(dto: RegisterDto) {
        const { email, username, password } = dto;

        const isEmailValid = await this.emailService.isEmailValid(email);

        if (!isEmailValid) {
            throw new BadRequestException('Invalid email');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.userService.create(
            username,
            email,
            hashedPassword,
        );

        const token = this.jwtService.sign(
            { email: user.email, t: 'verify-email' },
            { expiresIn: '24h' },
        );

        try {
            await this.emailService.sendVerificationEmail(
                username,
                email,
                token,
            );
        } catch (e) {
            this._logger.error('Failed to send verification email', e);
        }
    }

    async login(dto: LoginDto): Promise<{ token: string }> {
        const { identifier, password, rememberMe } = dto;

        const user = await this.userService.get(identifier);
        if (!user)
            throw new UnauthorizedException('Invalid username or password');
        if (!user.verified)
            throw new ForbiddenException('Please confirm your email');

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid)
            throw new UnauthorizedException('Invalid username or password');

        const payload: UserTokenPayload = { identifier, role: UserRoles.User };
        const expiry = rememberMe ? { expiresIn: '30d' } : undefined;

        const token = this.jwtService.sign(payload, expiry);

        return { token };
    }

    async resendVerificationEmail(dto: ResendVerificationEmailDto) {
        const { email } = dto;
        const user = await this.userService.get(email);
        if (!user || user.verified) {
            // silent return to avoid enumeration
            return;
        }

        const token = this.jwtService.sign(
            { email: user.email, t: 'verify-email' },
            { expiresIn: '24h' },
        );

        try {
            await this.emailService.sendVerificationEmail(
                user.username,
                email,
                token,
            );
        } catch (e) {
            this._logger.error('Failed to send verification email', e);
        }
    }

    guestLogin(): { token: string } {
        const id = nanoid();

        const payload: UserTokenPayload = {
            identifier: id,
            role: UserRoles.Guest,
        };
        const expiry = { expiresIn: '24h' };

        const token = this.jwtService.sign(payload, expiry);

        return { token };
    }

    async confirmEmail(
        authHeader: string,
    ): Promise<{ message: string; token: string }> {
        const token = authHeader.replace(/^Bearer\s+/, '');
        let payload: unknown;
        try {
            payload = this.jwtService.verify(token);
        } catch (e: unknown) {
            if (e instanceof TokenExpiredError) {
                throw new UnauthorizedException('Confirmation link expired');
            }
            throw new UnauthorizedException('Invalid confirmation link');
        }
        if (!isEmailTokenPayload(payload)) {
            throw new UnauthorizedException('Invalid confirmation link');
        }

        const email = payload.email;

        const dbUser = await this.userService.get(email);
        if (!dbUser)
            throw new UnauthorizedException('Invalid confirmation link');
        if (dbUser.verified)
            throw new ConflictException('Email already verified');

        await this.prisma.user.update({
            where: { email },
            data: { verified: true },
        });

        const jwtPayload: UserTokenPayload = {
            identifier: dbUser.username,
            role: UserRoles.User,
        };

        const authToken = this.jwtService.sign(jwtPayload);

        return { message: 'Email successfully verified', token: authToken };
    }
}
