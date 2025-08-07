import { Injectable } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { UserRoles } from '@/shared/enums/user-roles';

export interface AccountInfo {
    role: UserRoles,
    username: string;
    email: string;
    displayName: string;
    supporter: boolean;
}

@Injectable()
export class AccountService {
    constructor(private userService: UserService) {}

    async getAccountInfo(username: string): Promise<AccountInfo> {
        const user = await this.userService.getOrThrow(username);
        return {
            role: UserRoles.User, // TODO: get from the db when admins are added
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            supporter: user.supporter,
        } satisfies AccountInfo;
    }
}
