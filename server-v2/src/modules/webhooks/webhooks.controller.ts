import {
    Controller,
    Post,
    Req,
    BadRequestException,
    RawBodyRequest,
    Headers,
    HttpCode
} from '@nestjs/common';
import { WebhooksService } from '@/modules/webhooks/webhooks.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('webhooks')
export class WebhooksController {
    constructor(private webhooksService: WebhooksService) {}

    @Post('stripe')
    @HttpCode(201)
    async stripe(
        @Headers('stripe-signature') signature: string,
        @Req() req: RawBodyRequest<Request>,
    ) {
        const payload = req.rawBody;
        if (!payload) throw new BadRequestException();
        await this.webhooksService.handleWebhook(payload, signature);
    }
}
