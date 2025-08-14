export interface PresenceServerToClientEvents {
    'presence:self': { status: 'online' | 'offline' };
    'presence:online': { userId: string };
    'presence:offline': { userId: string };
}

export interface PresenceClientToServerEvents {
    'presence:ping': (
        payload: { sentAt: number },
        ack: (resp: { serverTime: number; rttMs: number }) => void,
    ) => void;
}

export interface PresenceInterServerEvents {}
export interface PresenceSocketData {
    user?: { id: string | number; [k: string]: any };
}
