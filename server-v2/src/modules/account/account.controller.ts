import { AuthenticatedRequest } from '@/shared/types/express';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AccountService } from '@/modules/account/account.service';

@Controller('account')
export class AccountController {
    constructor(private accountService: AccountService) {}

    @UseGuards(JwtAuthGuard)
    @Get('')
    async getMe(@Req() req: AuthenticatedRequest) {
        if (req.user.role === 'guest') return req.user;
        return this.accountService.getAccountInfo(req.user.username);
    }
}
