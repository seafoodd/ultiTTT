import { Injectable } from '@nestjs/common';
import type { ServerOptions } from 'socket.io';
import { EnvConfig } from '@/core/config/env.config';

@Injectable()
export class SocketConfig {
    constructor(private readonly envConfig: EnvConfig) {}

    getOptions(): Partial<ServerOptions> {
        return {
            path:
                this.envConfig.getEnvVar('SOCKET_IO_PATH') ||
                (this.envConfig.isProduction ? '/sockets/socket.io' : '/socket.io'),
            cors: {
                origin: (this.envConfig.getEnvVar('DOMAIN_URL') || '*')
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
                credentials: true,
            },
            transports: ['websocket', 'polling'],
            pingInterval: 15_000,
            pingTimeout: 20_000,
            allowEIO3: false,
        };
    }
}
