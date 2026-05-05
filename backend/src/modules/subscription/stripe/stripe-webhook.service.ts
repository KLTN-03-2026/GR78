import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { SubscriptionPaymentRepository } from '../repositories/subscription-payment.repository';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { SubscriptionPaymentStatus } from '../enums/subscription-payment-status.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { SubscriptionNotificationService } from '../services/subscription-notification.service';
import { StripeService } from './stripe.service';

interface StripePaymentIntent {
    id: string;
    last_payment_error?: { message?: string } | null;
}

@Injectable()
export class StripeWebhookService {
    private readonly logger = new Logger(StripeWebhookService.name);

    constructor(
        private readonly stripeService: StripeService,
        private readonly paymentRepo: SubscriptionPaymentRepository,
        private readonly subscriptionRepo: SubscriptionRepository,
        private readonly notificationService: SubscriptionNotificationService,
        private readonly dataSource: DataSource,
    ) {}

    async handleEvent(payload: Buffer, signature: string): Promise<void> {
        let event: any;
        try {
            event = this.stripeService.constructWebhookEvent(payload, signature);
        } catch (err) {
            this.logger.error('Stripe webhook signature verification failed', err);
            throw new BadRequestException('Invalid Stripe webhook signature');
        }

        this.logger.log(`Stripe webhook received: ${event.type} (id=${event.id})`);

        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSucceeded(event.data.object as StripePaymentIntent);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailed(event.data.object as StripePaymentIntent);
                break;
            case 'payment_intent.canceled':
                await this.handlePaymentCanceled(event.data.object as StripePaymentIntent);
                break;
            default:
                this.logger.log(`Unhandled Stripe event type: ${event.type}`);
        }
    }

    private async handlePaymentSucceeded(paymentIntent: StripePaymentIntent): Promise<void> {
        const payment = await this.paymentRepo.findByStripePaymentIntentId(paymentIntent.id);
        if (!payment) {
            this.logger.warn(`No payment found for Stripe PaymentIntent: ${paymentIntent.id}`);
            return;
        }

        if (payment.status === SubscriptionPaymentStatus.PAID) {
            this.logger.log(`Payment ${payment.id} already PAID — idempotent skip`);
            return;
        }

        let periodEnd!: Date;

        await this.dataSource.transaction(async (manager: EntityManager) => {
            const now = new Date();
            const durationDays = payment.plan?.getDurationDays?.() ?? 30;
            const periodStart = now;
            periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

            await this.paymentRepo.update(
                payment.id,
                {
                    status: SubscriptionPaymentStatus.PAID,
                    paidAt: now,
                    notes: `Paid via Stripe. PaymentIntent: ${paymentIntent.id}`,
                },
                manager,
            );

            const subscription = await this.subscriptionRepo.findByUserIdWithLock(
                payment.userId,
                manager,
            );
            if (!subscription) {
                this.logger.error(`No subscription found for user ${payment.userId}`);
                return;
            }

            await this.subscriptionRepo.update(
                subscription.id,
                {
                    status: SubscriptionStatus.ACTIVE,
                    planId: payment.planId,
                    currentPeriodStart: periodStart,
                    currentPeriodEnd: periodEnd,
                    discountId: payment.discountId,
                },
                manager,
            );

            this.logger.log(
                `Subscription activated via Stripe webhook: user=${payment.userId}, until=${periodEnd.toISOString()}`,
            );
        });

        const planName = payment.plan?.name ?? 'Subscription plan';
        this.notificationService
            .notifyPaymentConfirmed(payment.userId, Number(payment.finalAmount), planName)
            .catch(err => this.logger.error('Failed to send payment confirmed notification', err));

        this.notificationService
            .notifySubscriptionActivated(payment.userId, planName, periodEnd)
            .catch(err =>
                this.logger.error('Failed to send subscription activated notification', err),
            );
    }

    private async handlePaymentFailed(paymentIntent: StripePaymentIntent): Promise<void> {
        const payment = await this.paymentRepo.findByStripePaymentIntentId(paymentIntent.id);
        if (!payment || payment.status !== SubscriptionPaymentStatus.PENDING) return;

        const errorMessage =
            paymentIntent.last_payment_error?.message ?? 'Payment failed';

        await this.paymentRepo.update(payment.id, {
            status: SubscriptionPaymentStatus.FAILED,
            notes: `Payment failed via Stripe: ${errorMessage}`,
        });

        this.logger.log(`Payment marked FAILED via Stripe webhook: ${payment.id}`);
    }

    private async handlePaymentCanceled(paymentIntent: StripePaymentIntent): Promise<void> {
        const payment = await this.paymentRepo.findByStripePaymentIntentId(paymentIntent.id);
        if (!payment || payment.status !== SubscriptionPaymentStatus.PENDING) return;

        await this.paymentRepo.update(payment.id, {
            status: SubscriptionPaymentStatus.FAILED,
            notes: 'Stripe PaymentIntent was cancelled',
        });

        this.logger.log(`Payment marked FAILED due to Stripe PI cancellation: ${payment.id}`);
    }
}
