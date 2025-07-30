import { Injectable, Logger } from '@nestjs/common';
import { EnvConfig } from '@/core/config/env.config';
import { StripeService } from '@/modules/payments/stripe/stripe.service';

enum EventTypes {
    CheckoutSessionCompleted = 'checkout.session.completed',
    ChargeSucceeded = 'charge.succeeded',
}

@Injectable()
export class WebhooksService {
    private readonly _stripeWebhook: string;

    constructor(
        private stripe: StripeService,
        envConfig: EnvConfig,
    ) {
        this._stripeWebhook = envConfig.getEnvVarOrThrow('STRIPE_WEBHOOK_SECRET');
    }

    async handleWebhook(payload: Buffer, signature: string) {
        const event = this.stripe.webhooks.constructEvent(
            payload,
            signature,
            this._stripeWebhook,
        );

        switch(event.type) {
            case EventTypes.ChargeSucceeded:
                // const billingInfo = event.data.object.billing_details;
                // const paymentInfo = event.data.object.payment_method_details;
                // const receiptUrl = event.data.object.receipt_url;
                // const paymentId = event.data.object.payment_intent.toString();
                // await this.orderService.createOrderByCharge(paymentId,billingInfo,paymentInfo,receiptUrl);
                break;
            case EventTypes.CheckoutSessionCompleted:
                // const paymentId = event.data.object.payment_intent.toString();
                // const sessionId = event.data.object.id;
                // const total = event.data.object.amount_total;
                // const email = event.data.object.customer_details.email;
                // const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
                // await this.orderService.updateOrderByCharge(paymentId, email, total, lineItems.data, event.data.object);
                // break;
        }
    }
}
