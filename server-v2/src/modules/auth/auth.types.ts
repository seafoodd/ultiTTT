import { UserRoles } from '@/shared/enums/user-roles';

export interface EmailTokenPayload {
    email: string;
    t: 'verify-email';
}

export interface UserTokenPayload {
    identifier: string;
    role: UserRoles;
}

export function isEmailTokenPayload(
    payload: unknown,
): payload is EmailTokenPayload {
    if (typeof payload !== 'object' || payload === null) return false;

    const obj = payload as Record<string, unknown>;

    return typeof obj.email === 'string' && obj.t === 'verify-email';
}
