import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { UserModule } from '@/modules/user/user.module';

@Module({
    imports: [UserModule],
    providers: [AccountService],
    controllers: [AccountController],
})
export class AccountModule {}
