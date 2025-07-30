import Stripe from 'stripe';
import {
    Injectable,
    Logger,
    ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { EnvConfig } from '@/core/config/env.config';
import { User } from '@prisma/client';
import { StripeService } from '@/modules/payments/stripe/stripe.service';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        private prisma: PrismaService,
        private envConfig: EnvConfig,
        private stripe: StripeService,
        private userService: UserService,
    ) {}

    async createCheckoutSession(
        username: string,
        priceId: string,
        successUrl: string,
        cancelUrl: string,
    ): Promise<string> {
        const user = await this.userService.getOrThrow(username);
        const customerId = await this.getOrCreateCustomer(user);

        const url = new URL(successUrl);
        url.searchParams.append('session_id', '{CHECKOUT_SESSION_ID}');
        const successUrlWithSession = url.toString();

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
            success_url: successUrlWithSession,
            cancel_url: cancelUrl,
        };

        try {
            const session =
                await this.stripe.checkout.sessions.create(sessionData);

            this.logger.log(
                `Created checkout session for user ${username} (session id: ${session.id})`,
            );

            return session.id;
        } catch (error) {
            this.logger.error('Stripe checkout session creation failed', error);
            throw new ServiceUnavailableException(
                'Unable to create checkout session',
            );
        }
    }
    // async createSubscription(dto: CreateSubscriptionDto) {
    //   const { username, priceId } = dto;
    //
    //   const customerId = await this.getOrCreateCustomer(username);
    //
    //   const subscription = this.stripe.subscriptions.create({
    //     customer: customerId,
    //     items: [{ price: priceId }],
    //     payment_behavior: 'default_incomplete',
    //     expand: ['latest_invoice.payment_intent'],
    //   });
    //
    //   this.logger.log(
    //     `Subscription created successfully for customer ${username} (${customerId})`,
    //   );
    //
    //   return subscription;
    // }
    //
    // async createDonation(dto: CreateDonationDto) {
    //   const { amount, currency, paymentMethodId } = dto;
    //
    //   return await this.stripe.paymentIntents.create({
    //     amount,
    //     currency,
    //     payment_method: paymentMethodId,
    //     confirm: true,
    //   });
    // }
    //
    async getOrCreateCustomer(user: User): Promise<string> {
        if (user.stripeCustomerId) return user.stripeCustomerId;

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

    // // Handle webhook events securely
    // async handleWebhook(signature: string, payload: Buffer) {
    //   const endpointSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    //   try {
    //     const event = this.stripe.webhooks.constructEvent(
    //       payload,
    //       signature,
    //       endpointSecret,
    //     );
    //     // handle events like payment_intent.succeeded, invoice.paid, customer.subscription.created, etc.
    //     return event;
    //   } catch (err) {
    //     throw new Error('Webhook signature verification failed.');
    //   }
    // }
}
