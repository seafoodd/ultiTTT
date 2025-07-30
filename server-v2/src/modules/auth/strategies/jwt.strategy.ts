import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { EnvConfig } from '@/core/config/env.config';
import { UserService } from '@/modules/user/user.service';

export type JwtPayload = {
  role: 'user' | 'guest';
  identifier: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    envConfig: EnvConfig,
  ) {
    const token = envConfig.getEnvVarOrThrow('ACCESS_TOKEN_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: token,
    });
  }

  // called by Passport after validation
  async validate(payload: JwtPayload) {
    if (payload.role === 'user') {
      const dbUser = await this.userService.get(payload.identifier);

      if (!dbUser) throw new UnauthorizedException('User not found');
      if (!dbUser.verified)
        throw new ForbiddenException('Please confirm your email');

      return {
        username: dbUser.displayName,
        identifier: dbUser.username,
        role: 'user',
      };
    }

    if (payload.role === 'guest') {
      return {
        username: 'Guest',
        identifier: payload.identifier,
        role: 'guest',
      };
    }

    throw new UnauthorizedException('Invalid role in token');
  }
}
