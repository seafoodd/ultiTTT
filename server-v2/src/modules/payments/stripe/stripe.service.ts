import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { EnvConfig } from '@/core/config/env.config';

@Injectable()
export class StripeService extends Stripe {
    constructor(envConfig: EnvConfig) {
        super(envConfig.getEnvVarOrThrow('STRIPE_API_KEY'));
    }

    async userHasActiveSubscription(stripeCustomerId: string): Promise<boolean> {
        const subscriptions = await this.subscriptions.list({
            customer: stripeCustomerId,
            status: 'active',
            limit: 1,
        });
        return subscriptions.data.length > 0;
    }

}
