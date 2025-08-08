import { Module } from '@nestjs/common';
import { StripeModule } from '@/modules/payments/stripe/stripe.module';
import { WebhooksController } from '@/modules/webhooks/webhooks.controller';
import { WebhooksService } from '@/modules/webhooks/webhooks.service';
import { CoreModule } from '@/core/core.module';
import { UserModule } from '@/modules/user/user.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';

@Module({
    imports: [StripeModule, CoreModule, UserModule, SubscriptionModule],
    controllers: [WebhooksController],
    providers: [WebhooksService],
})
export class WebhooksModule {}
