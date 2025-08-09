import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    UseGuards,
    Req,
    NotFoundException
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CheckoutDto } from '@/modules/payments/dto/checkout.dto';
import { AuthenticatedRequest } from '@/shared/types/express';
import { RequireUserGuard } from '@/shared/guards/roles/require-user.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @UseGuards(RequireUserGuard)
    @Post('checkout')
    async checkout(@Body() dto: CheckoutDto, @Req() req: AuthenticatedRequest) {
        const user = req.user;
        const sessionId = await this.paymentsService.checkout(
            user.username,
            dto.priceName,
        );
        return { sessionId };
    }

    @Get('session-status')
    async sessionStatus(@Query('session_id') sessionId: string) {
        return this.paymentsService.sessionStatus(sessionId);
    }

    @UseGuards(RequireUserGuard)
    @Get('subscription-status')
    async subscriptionStatus(@Req() req: AuthenticatedRequest) {
        const user = req.user;
        const subscription =
            await this.paymentsService.getActiveSubscription(user.identifier);
        return { subscription };
    }

    @UseGuards(RequireUserGuard)
    @Post('cancel-subscription')
    async cancelSubscription(@Req() req: AuthenticatedRequest){
        const user = req.user;
        const subscription =
            await this.paymentsService.getActiveSubscription(user.identifier);
        if (!subscription || subscription.cancel_at_period_end) {
            throw new NotFoundException('No cancelable subscription found');
        }
        return this.paymentsService.cancelSubscription(subscription.id)
    }

    @UseGuards(RequireUserGuard)
    @Post('resume-subscription')
    async resumeSubscription(@Req() req: AuthenticatedRequest){
        const user = req.user;
        const subscription =
            await this.paymentsService.getActiveSubscription(user.identifier);
        if (!subscription || !subscription.cancel_at_period_end) {
            throw new NotFoundException('No resumable subscription found');
        }
        return this.paymentsService.resumeSubscription(subscription.id)
    }
}
