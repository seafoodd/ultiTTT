import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from '@/modules/payments/dto/create-checkout-session.dto';
import { AuthenticatedRequest } from '@/shared/types/express';
import { RequireUserGuard } from '@/shared/guards/roles/require-user.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(RequireUserGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    const sessionId = await this.paymentsService.createCheckoutSession(
      user.username,
      dto.priceId,
      dto.successUrl,
      dto.cancelUrl,
    );
    return { sessionId };
  }

  // @Post('subscription')
  // async createSubscription(@Body() dto: CreateSubscriptionDto) {
  //   return this.paymentsService.createSubscription(dto);
  // }
  //
  // @Post('donation')
  // async createDonation(@Body() dto: CreateDonationDto) {
  //   return this.paymentsService.createDonation(dto);
  // }

  // @Post('webhook')
  // @HttpCode(HttpStatus.OK)
  // async handleWebhook(@Req() req: Request, @Res() res: Response, @Headers('stripe-signature') signature: string) {
  //   try {
  //     const event = await this.paymentsService.handleWebhook(signature, req.rawBody);
  //     // Process event as needed
  //     res.send({ received: true });
  //   } catch (error) {
  //     res.status(400).send(`Webhook Error: ${error.message}`);
  //   }
  // }
}
