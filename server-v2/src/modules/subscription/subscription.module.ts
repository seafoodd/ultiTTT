import { Module } from '@nestjs/common';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { UserModule } from '@/modules/user/user.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        UserModule,
        PaymentsModule,
        PrismaModule,
    ],
    providers: [SubscriptionService],
    exports: [SubscriptionService],
})
export class SubscriptionModule {}
