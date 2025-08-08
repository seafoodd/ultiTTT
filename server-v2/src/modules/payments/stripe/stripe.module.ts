import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CoreModule } from '@/core/core.module';

@Module({
    imports: [CoreModule],
    providers: [StripeService],
    exports: [StripeService],
})
export class StripeModule {}
