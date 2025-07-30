import { Module } from '@nestjs/common';
import { EnvConfig } from '@/core/config/env.config';
import { StripeModule } from '@/modules/payments/stripe/stripe.module';
import { WebhooksController } from '@/modules/webhooks/webhooks.controller';
import { WebhooksService } from '@/modules/webhooks/webhooks.service';

@Module({
    controllers: [WebhooksController],
    providers: [WebhooksService, EnvConfig],
    imports: [StripeModule],
})
export class WebhooksModule {}
