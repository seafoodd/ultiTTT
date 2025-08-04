import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { EnvConfig } from '@/core/config/env.config';

@Injectable()
export class StripeService extends Stripe {
    constructor(envConfig: EnvConfig) {
        super(envConfig.getEnvVarOrThrow('STRIPE_API_KEY'));
    }
}
