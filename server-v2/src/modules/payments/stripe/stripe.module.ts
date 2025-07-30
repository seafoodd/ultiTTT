import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { EnvConfig } from '@/core/config/env.config';

@Module({
  providers: [StripeService, EnvConfig],
  exports: [StripeService],
})
export class StripeModule {}
