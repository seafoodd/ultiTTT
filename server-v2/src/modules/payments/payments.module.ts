import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { EnvConfig } from '@/core/config/env.config';
import { StripeModule } from './stripe/stripe.module';
import { UserService } from '@/modules/user/user.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, EnvConfig, UserService],
  imports: [StripeModule],
})
export class PaymentsModule {}
