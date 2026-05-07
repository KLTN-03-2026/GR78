import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { GetPaymentsQueryDto } from '../dtos/subscription-payment.dto';
import { SubscriptionPayment } from '../entities/subscription-payment.entity';
import { SubscriptionPaymentStatus } from '../enums/subscription-payment-status.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import {
    PaymentNotFoundException,
    SubscriptionNotFoundException,
} from '../exceptions/subscription.exception';
import { SubscriptionPaymentRepository } from '../repositories/subscription-payment.repository';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { SubscriptionNotificationService } from './subscription-notification.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class SubscriptionPaymentService {
    private readonly logger = new Logger(SubscriptionPaymentService.name);

    constructor(
        private readonly paymentRepo: SubscriptionPaymentRepository,
        private readonly subscriptionRepo: SubscriptionRepository,
        private readonly notificationService: SubscriptionNotificationService,
        private readonly stripeService: StripeService,
        private readonly dataSource: DataSource,
    ) {}

    async getMyPayments(
        userId: string,
        query: GetPaymentsQueryDto,
    ): Promise<{ payments: SubscriptionPayment[]; total: number }> {
        const [payments, total] = await this.paymentRepo.findByUserId(
            userId,
            query.status,
            query.page,
            query.limit,
        );
        return { payments, total };
    }

    async getAllPayments(
        query: GetPaymentsQueryDto,
    ): Promise<{ payments: SubscriptionPayment[]; total: number }> {
        const [payments, total] = await this.paymentRepo.findAll(
            query.status,
            query.page,
            query.limit,
        );
        return { payments, total };
    }

    async cancelPendingPayment(userId: string): Promise<void> {
        const subscription = await this.subscriptionRepo.findByUserId(userId);
        if (!subscription) throw new SubscriptionNotFoundException();

        const pending = await this.paymentRepo.findPendingBySubscriptionId(subscription.id);
        if (!pending) throw new PaymentNotFoundException();

        if (pending.stripePaymentIntentId) {
            try {
                await this.stripeService.cancelPaymentIntent(pending.stripePaymentIntentId);
                this.logger.log(`Stripe PI cancelled: ${pending.stripePaymentIntentId}`);
            } catch (err) {
                // Log but do not block — Stripe may have already cancelled it
                this.logger.warn(
                    `Could not cancel Stripe PI ${pending.stripePaymentIntentId}: ${(err as Error).message}`,
                );
            }
        }

        await this.paymentRepo.update(pending.id, {
            status: SubscriptionPaymentStatus.FAILED,
            notes: 'Cancelled by user',
        });

        this.logger.log(`Pending payment ${pending.id} cancelled by user ${userId}`);
    }

    async confirmPayment(paymentId: string, adminNotes?: string): Promise<SubscriptionPayment> {
        return this.dataSource.transaction(async (manager: EntityManager) => {
            const payment = await this.paymentRepo.findById(paymentId, manager);
            if (!payment) throw new PaymentNotFoundException();

            if (payment.status !== SubscriptionPaymentStatus.PENDING) {
                throw new PaymentNotFoundException();
            }

            const subscription = await this.subscriptionRepo.findByUserIdWithLock(
                payment.userId,
                manager,
            );
            if (!subscription) throw new SubscriptionNotFoundException();

            const now = new Date();
            const plan = payment.plan;
            const durationDays = plan
                ? (plan.getDurationDays ? plan.getDurationDays() : 30)
                : 30;

            const periodStart = now;
            const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

            await this.paymentRepo.update(
                paymentId,
                {
                    status: SubscriptionPaymentStatus.PAID,
                    paidAt: now,
                    notes: adminNotes,
                },
                manager,
            );

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
                `Payment confirmed (admin): ${paymentId} → subscription ${subscription.id} active until ${periodEnd.toISOString()}`,
            );

            const planName = plan?.name ?? 'Subscription plan';
            this.notificationService
                .notifyPaymentConfirmed(payment.userId, Number(payment.finalAmount), planName)
                .catch(err => this.logger.error('Failed to send payment confirmed notification', err));

            this.notificationService
                .notifySubscriptionActivated(payment.userId, planName, periodEnd)
                .catch(err => this.logger.error('Failed to send subscription activated notification', err));

            return (await this.paymentRepo.findById(paymentId))!;
        });
    }

    async refundPayment(paymentId: string, adminNotes?: string): Promise<SubscriptionPayment> {
        return this.dataSource.transaction(async (manager: EntityManager) => {
            const payment = await this.paymentRepo.findById(paymentId, manager);
            if (!payment) throw new PaymentNotFoundException();

            if (payment.status !== SubscriptionPaymentStatus.PAID) {
                throw new PaymentNotFoundException();
            }

            // Issue Stripe refund when the payment was made through Stripe
            if (payment.stripePaymentIntentId) {
                try {
                    await this.stripeService.createRefund(payment.stripePaymentIntentId);
                    this.logger.log(
                        `Stripe refund created for PaymentIntent: ${payment.stripePaymentIntentId}`,
                    );
                } catch (err) {
                    this.logger.error(
                        `Failed to create Stripe refund for PI ${payment.stripePaymentIntentId}`,
                        err,
                    );
                    throw new InternalServerErrorException(
                        'Failed to process refund with payment provider',
                    );
                }
            }

            await this.paymentRepo.update(
                paymentId,
                {
                    status: SubscriptionPaymentStatus.REFUNDED,
                    notes: adminNotes,
                },
                manager,
            );

            await this.subscriptionRepo.update(
                payment.subscriptionId,
                { status: SubscriptionStatus.CANCELLED },
                manager,
            );

            this.logger.log(`Payment refunded: ${paymentId}`);
            return (await this.paymentRepo.findById(paymentId))!;
        });
    }
}
