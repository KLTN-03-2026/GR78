import {
    BadRequestException,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Post,
    RawBodyRequest,
    Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { StripeWebhookService } from '../stripe/stripe-webhook.service';

@ApiTags('Stripe')
@Controller('subscription/stripe')
export class StripeWebhookController {
    constructor(private readonly stripeWebhookService: StripeWebhookService) {}

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Stripe webhook endpoint',
        description:
            'Receives Stripe payment lifecycle events. Do NOT call this endpoint directly — ' +
            'it is exclusively for Stripe webhook delivery. ' +
            'Handles: payment_intent.succeeded → activates subscription; ' +
            'payment_intent.payment_failed / canceled → marks payment as failed.',
    })
    async handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ): Promise<{ received: boolean }> {
        if (!req.rawBody) {
            throw new BadRequestException('Missing raw request body');
        }
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }
        await this.stripeWebhookService.handleEvent(req.rawBody, signature);
        return { received: true };
    }
}
