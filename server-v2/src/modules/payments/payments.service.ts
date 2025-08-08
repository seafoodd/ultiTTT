import Stripe from 'stripe';
import {
    Injectable,
    Logger,
    ServiceUnavailableException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@prisma/client';
import { StripeService } from '@/modules/payments/stripe/stripe.service';
import { UserService } from '@/modules/user/user.service';
import { EnvConfig } from '@/core/config/env.config';

@Injectable()
export class PaymentsService {
    private readonly _domainUrl: string;

    constructor(
        envConfig: EnvConfig,
        private readonly prisma: PrismaService,
        private readonly stripe: StripeService,
        private readonly userService: UserService,
    ) {
        this._domainUrl = envConfig.getEnvVarOrThrow('DOMAIN_URL');
    }

    private readonly _logger = new Logger(PaymentsService.name);

    async checkout(username: string, priceId: string): Promise<string> {
        const user = await this.userService.getOrThrow(username);
        const customerId = await this.getOrCreateCustomer(user);

        if (user.supporter) {
            throw new BadRequestException(
                'You already have an active subscription. Please cancel it in your settings first.',
            );
        }

        const successUrl =
            this._domainUrl + '/donate' + '?session_id={CHECKOUT_SESSION_ID}';
        const cancelUrl = this._domainUrl + '/donate';

        const lineItems = [
            {
                price: priceId,
                quantity: 1,
            },
        ];

        const sessionData: Stripe.Checkout.SessionCreateParams = {
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: lineItems,
            success_url: successUrl,
            cancel_url: cancelUrl,
        };

        try {
            const session =
                await this.stripe.checkout.sessions.create(sessionData);

            this._logger.log(
                `Created checkout session for user ${username} (session id: ${session.id})`,
            );

            return session.id;
        } catch (error) {
            this._logger.error(
                'Stripe checkout session creation failed',
                error,
            );
            throw new ServiceUnavailableException(
                'Unable to create checkout session',
            );
        }
    }

    async resumeSubscription(stripeSubscriptionId: string) {
        return this.stripe.subscriptions.update(stripeSubscriptionId, {
            cancel_at_period_end: false,
        });
    }

    async cancelSubscription(stripeSubscriptionId: string) {
        return this.stripe.subscriptions.update(stripeSubscriptionId, {
            cancel_at_period_end: true,
        });
    }

    async sessionStatus(sessionId: string) {
        if (!sessionId) {
            throw new BadRequestException('Missing session_id query parameter');
        }

        try {
            const session =
                await this.stripe.checkout.sessions.retrieve(sessionId);

            return {
                payment_status: session.payment_status,
                customer_email: session.customer_details?.email,
                amount_total: session.amount_total,
                currency: session.currency,
            };
        } catch (error) {
            throw new BadRequestException(
                `Failed to retrieve session: ${error.message}`,
            );
        }
    }

    async getOrCreateCustomer(user: User): Promise<string> {
        if (user.stripeCustomerId) {
            try {
                const existingCustomer = await this.stripe.customers.retrieve(
                    user.stripeCustomerId,
                );
                if (!existingCustomer.deleted) {
                    return user.stripeCustomerId;
                }
            } catch (error) {
                if (error.code !== 'resource_missing') throw error;
            }
        }
        const customer = await this.stripe.customers.create({
            email: user.email,
            metadata: {
                username: user.username,
            },
        });

        await this.prisma.user.update({
            where: {
                username: user.username,
            },
            data: {
                stripeCustomerId: customer.id,
            },
        });

        return customer.id;
    }

    async getActiveSubscription(identifier: string) {
        const user = await this.userService.getOrThrow(identifier);
        if (!user.stripeCustomerId) return null;

        const subscriptions = await this.stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active',
            limit: 1,
        });

        return subscriptions.data.length > 0 ? subscriptions.data[0] : null;
    }
}
