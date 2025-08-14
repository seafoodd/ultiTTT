import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import type { ServerOptions } from 'socket.io';
import { SocketConfig } from './socket.config';
import { EnvConfig } from '@/core/config/env.config';

export class RedisIoAdapter extends IoAdapter {
    private _redisUrl: string | undefined;

    constructor(
        app: any,
        private readonly socketConfig: SocketConfig,
        private readonly envConfig: EnvConfig,
    ) {
        super(app);
        this._redisUrl = envConfig.getEnvVar('REDIS_URL');
    }

    private adapterConstructor?: ReturnType<typeof createAdapter>;

    async connect(url = this._redisUrl || 'redis://localhost:6379') {
        const pub = createClient({ url });
        const sub = pub.duplicate();
        await pub.connect();
        await sub.connect();
        this.adapterConstructor = createAdapter(pub, sub);
    }

    createIOServer(port: number, options?: ServerOptions) {
        const server = super.createIOServer(port, {
            ...this.socketConfig.getOptions(),
            ...options,
        });
        server.adapter(this.adapterConstructor!);
        return server;
    }
}
