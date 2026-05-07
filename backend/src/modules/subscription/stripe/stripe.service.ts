import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private readonly logger = new Logger(StripeService.name);
    // `any` avoids the CJS/namespace type mismatch in Stripe v22; runtime is fully typed.
    private readonly stripe: any;
    private readonly webhookSecret: string;

    constructor(private readonly configService: ConfigService) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured');

        this.stripe = new Stripe(secretKey, {
            apiVersion: '2026-04-22.dahlia',
        });

        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        this.webhookSecret = webhookSecret;
    }

    async createPaymentIntent(
        amount: number,
        metadata: Record<string, string>,
    ): Promise<{ id: string; client_secret: string }> {
        this.logger.log(`Creating Stripe PaymentIntent for ${amount} VND`);
        return this.stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: 'vnd',
            metadata,
            automatic_payment_methods: { enabled: true },
        });
    }

    constructWebhookEvent(payload: Buffer, signature: string): any {
        return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    }

    async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
        this.logger.log(`Cancelling Stripe PaymentIntent: ${paymentIntentId}`);
        await this.stripe.paymentIntents.cancel(paymentIntentId);
    }

    async createRefund(paymentIntentId: string): Promise<void> {
        this.logger.log(`Creating Stripe refund for PaymentIntent: ${paymentIntentId}`);
        await this.stripe.refunds.create({ payment_intent: paymentIntentId });
    }
}
