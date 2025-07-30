import {
    Controller,
    Post,
    Req,
    BadRequestException,
    RawBodyRequest,
    Headers
} from '@nestjs/common';
import { WebhooksService } from '@/modules/webhooks/webhooks.service';

@Controller('webhooks')
export class WebhooksController {
    constructor(private webhooksService: WebhooksService) {}

    @Post('stripe')
    async stripe(
        @Headers('stripe-signature') signature: string,
        @Req() req: RawBodyRequest<Request>,
    ) {
        const payload = req.rawBody;
        if(!payload) throw new BadRequestException();
        await this.webhooksService.handleWebhook(payload, signature);
    }
}
