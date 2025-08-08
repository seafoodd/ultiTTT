import { Injectable, Logger } from '@nestjs/common';
import { EnvConfig } from '@/core/config/env.config';
import { StripeService } from '@/modules/payments/stripe/stripe.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import Stripe from 'stripe';
import { UserService } from '@/modules/user/user.service';

enum EventType {
    CheckoutSessionCompleted = 'checkout.session.completed',
    InvoicePaymentSucceeded = 'invoice.payment_succeeded',
    CustomerSubscriptionUpdated = 'customer.subscription.updated',
    CustomerSubscriptionDeleted = 'customer.subscription.deleted',
}

enum PaymentStatus {
    Paid = 'paid',
}

enum SubscriptionStatus {
    Canceled = 'canceled',
    Unpaid = 'unpaid',
}

@Injectable()
export class WebhooksService {
    private readonly _stripeWebhook: string;

    private readonly _logger = new Logger(WebhooksService.name);

    constructor(
        private readonly stripe: StripeService,
        envConfig: EnvConfig,
        private readonly subscriptionService: SubscriptionService,
        private readonly userService: UserService,
    ) {
        this._stripeWebhook = envConfig.getEnvVarOrThrow(
            'STRIPE_WEBHOOK_SECRET',
        );
    }

    async handleWebhook(payload: Buffer, signature: string) {
        const event = this.stripe.webhooks.constructEvent(
            payload,
            signature,
            this._stripeWebhook,
        );

        this._logger.debug(event.type);

        const eventDataObject = event.data.object as unknown;

        switch (event.type) {
            case EventType.CheckoutSessionCompleted:
                await this._handleCheckoutSessionCompleted(
                    eventDataObject as Stripe.Checkout.Session,
                );
                break;

            case EventType.InvoicePaymentSucceeded:
                await this._handleInvoicePaymentSucceeded(
                    eventDataObject as Stripe.Invoice,
                );
                break;

            case EventType.CustomerSubscriptionUpdated:
                await this._handleCustomerSubscriptionUpdated(
                    eventDataObject as Stripe.Subscription,
                );
                break;

            case EventType.CustomerSubscriptionDeleted:
                await this._handleCustomerSubscriptionDeleted(
                    eventDataObject as Stripe.Subscription,
                );
                break;

            default:
                this._logger.warn(`Unhandled Stripe event type: ${event.type}`);
                break;
        }
    }

    private async _handleCheckoutSessionCompleted(
        session: Stripe.Checkout.Session,
    ) {
        if (session.payment_status !== PaymentStatus.Paid) {
            this._logger.warn(
                'Checkout session payment status is not paid, skipping.',
            );
            return;
        }

        const customerId = session.customer as string | undefined;
        const subscriptionId = session.subscription as string | undefined;

        if (!customerId || !subscriptionId) {
            this._logger.warn(
                'Missing customerId or subscriptionId in checkout session.',
            );
            return;
        }

        const user = await this.userService.getByCustomerId(customerId);
        if (!user) {
            this._logger.error(`No user found for customerId ${customerId}`);
            return;
        }

        const subscription =
            await this.stripe.subscriptions.retrieve(subscriptionId);
        await this.subscriptionService.activate(user.username, subscription);
    }

    private async _handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
        const invoiceSubscription =
            invoice.parent?.subscription_details?.subscription;
        if (!invoiceSubscription || typeof invoiceSubscription !== 'string') {
            this._logger.warn('Invoice has no valid subscription id.');
            console.log(invoiceSubscription, invoice);
            return;
        }

        const subscription =
            await this.stripe.subscriptions.retrieve(invoiceSubscription);
        const customerId = subscription.customer as string;

        const user = await this.userService.getByCustomerId(customerId);
        if (!user) {
            this._logger.error(`No user found for customerId ${customerId}`);
            return;
        }

        await this.subscriptionService.activate(user.username, subscription);
    }

    private async _handleCustomerSubscriptionUpdated(
        subscription: Stripe.Subscription,
    ) {
        const customerId = subscription.customer as string;
        const user = await this.userService.getByCustomerIdOrThrow(customerId);

        if (
            subscription.status === SubscriptionStatus.Canceled ||
            subscription.status === SubscriptionStatus.Unpaid
        ) {
            await this.subscriptionService.deactivate(user.username);
            return;
        }
    }

    private async _handleCustomerSubscriptionDeleted(
        subscription: Stripe.Subscription,
    ) {
        const customerId = subscription.customer as string;
        const user = await this.userService.getByCustomerIdOrThrow(customerId);

        this._logger.debug(
            subscription.id,
            'Reason: ' + subscription.cancellation_details?.reason,
        );

        await this.userService.update(user.username, {
            supporter: false,
            supporterUntil: null,
            subscriptionId: null,
        });
    }
}
