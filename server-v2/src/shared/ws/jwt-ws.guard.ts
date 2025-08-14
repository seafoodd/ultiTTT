import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtWsGuard implements CanActivate {
    constructor(private readonly jwt: JwtService) {}

    private readonly _logger = new Logger(JwtWsGuard.name)

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const client = ctx.switchToWs().getClient();
        const token =
            client?.handshake?.auth?.token ||
            String(client?.handshake?.headers?.authorization || '').replace(
                /^Bearer\s+/i,
                '',
            );

        if (!token) {
            this._logger.error('Missing token')
            throw new UnauthorizedException('Missing token');
        }

        try {
            const payload = await this.jwt.verifyAsync(token);
            client.data = client.data || {};
            client.data.user = payload;
            return true;
        } catch(e) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
