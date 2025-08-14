import { Module } from '@nestjs/common';
import { PresenceGateway } from './presence.gateway';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
    imports: [AuthModule],
    providers: [PresenceGateway],
})
export class PresenceModule {}
