import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { PaymentsService } from '@/modules/payments/payments.service';
import Stripe from 'stripe';
import { PrismaService } from '@/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionService {
    constructor(
        private readonly userService: UserService,
        private readonly paymentsService: PaymentsService,
        private readonly prisma: PrismaService,
    ) {}

    private readonly _logger = new Logger(SubscriptionService.name);

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async _deactivateExpiredSupporters() {
        this._logger.debug('Running supporter deactivation cron job...');
        const now = new Date();

        const dbQuery = {
            where: {
                supporter: true,
                supporterUntil: { lt: now },
            },
            data: {
                supporter: false,
                supporterUntil: null,
                subscriptionId: null,
            },
        };

        try {
            const result = await this.prisma.user.updateMany(dbQuery);

            this._logger.debug(
                `Deactivated ${result.count} expired supporter subscriptions.`,
            );
        } catch (error) {
            this._logger.error(
                'Failed to deactivate expired supporters',
                error,
            );
        }
    }

    async activate(
        identifier: string,
        subscription: Stripe.Subscription,
    ): Promise<void> {
        const subscriptionItem = subscription.items.data[0];

        if (!subscriptionItem?.current_period_end) {
            throw new Error('Subscription item or period end missing.');
        }

        const expiry = new Date(subscriptionItem.current_period_end * 1000);
        await this.userService.update(identifier, {
            supporter: true,
            supporterUntil: expiry,
            subscriptionId: subscription.id,
        });
    }

    async deactivate(identifier: string): Promise<void> {
        await this.userService.update(identifier, {
            supporter: false,
            supporterUntil: null,
            subscriptionId: null,
        });
    }

    async isActive(identifier: string): Promise<boolean> {
        const user = await this.userService.get(identifier);
        return user?.supporter ?? false;
    }

    async sync(identifier: string) {
        const subscription =
            await this.paymentsService.getActiveSubscription(identifier);
        if (subscription) {
            this._logger.debug('activate');
            await this.activate(identifier, subscription);
        } else {
            this._logger.debug('deactivate');
            await this.deactivate(identifier);
        }
    }
}
