import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    UseGuards,
    Req,
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
            dto.priceId,
        );
        return { sessionId };
    }

    @Get('session-status')
    async sessionStatus(@Query('session_id') sessionId: string) {
        return this.paymentsService.sessionStatus(sessionId);
    }
}
