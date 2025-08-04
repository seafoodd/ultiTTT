import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeModule } from './stripe/stripe.module';
import { UserModule } from '@/modules/user/user.module';
import { CoreModule } from '@/core/core.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
    imports: [StripeModule, UserModule, CoreModule, PrismaModule],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule {}
