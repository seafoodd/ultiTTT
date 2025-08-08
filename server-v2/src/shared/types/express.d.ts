import { Request } from 'express';
import { UserRoles } from '@/shared/enums/user-roles';

export interface AuthenticatedRequest extends Request {
    user: {
        username: string;
        identifier: string;
        role: UserRoles;
    };
}
