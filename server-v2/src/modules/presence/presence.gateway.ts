import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtWsGuard } from '@/shared/ws/jwt-ws.guard';
import { PRESENCE_NS, USER_ROOM } from './presence.constants';
import type {
    PresenceClientToServerEvents,
    PresenceInterServerEvents,
    PresenceServerToClientEvents,
    PresenceSocketData,
} from './presence.types';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    namespace: PRESENCE_NS,
})
@UseGuards(JwtWsGuard)
export class PresenceGateway
    implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket>
{
    constructor(private readonly jwt: JwtService) {}

    private readonly _logger = new Logger(PresenceGateway.name);

    @WebSocketServer()
    public server!: Server<
        PresenceClientToServerEvents,
        PresenceServerToClientEvents,
        PresenceInterServerEvents,
        PresenceSocketData
    >;

    async handleConnection(client: Socket & { data: PresenceSocketData }) {
        const raw =
            client.handshake?.auth?.token ||
            String(client.handshake?.headers?.authorization || '').replace(
                /^Bearer\s+/i,
                '',
            );

        let payload: any;
        try {
            payload = await this.jwt.verifyAsync(raw);
        } catch (e) {
            this._logger.warn(
                `handleConnection: invalid JWT for socket ${client.id}`,
            );
            client.disconnect(true);
            return;
        }

        client.data = client.data || {};
        client.data.user = payload;

        const user = client.data.user;
        const identifier = user?.identifier;

        if (!identifier) {
            this._logger.warn(
                `handleConnection: Connection without user.identifier, disconnecting socket ${client.id}`,
            );
            client.disconnect(true);
            return;
        }

        const room = USER_ROOM(identifier);
        await client.join(room);

        client.emit('presence:self', { status: 'online' });

        this._logger.debug(
            `User ${identifier} joined room ${room} (socket ${client.id})`,
        );
    }

    async handleDisconnect(client: Socket & { data: PresenceSocketData }) {
        const user = client.data.user;

        const identifier = user.identifier;

        if (!identifier) {
            this._logger.warn(
                `handleDisconnect: Connection without user.identifier, disconnecting socket ${client.id}`,
            );
            client.disconnect(true);
            return;
        }

        this._logger.debug(
            `User ${identifier} disconnected (socket ${client.id})`,
        );
    }

    @SubscribeMessage('presence:ping')
    handlePing(
        @MessageBody() payload: { sentAt: number },
    ) {
        const serverTime = Date.now();
        const rttMs = Math.max(0, serverTime - (payload?.sentAt ?? serverTime));
        return { serverTime, rttMs };
    }
}
