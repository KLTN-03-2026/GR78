import { NotificationCreationService } from '@/modules/notifications/services/notification-creation.service';
import { NotificationType } from '@/modules/notifications/enums/notification.enum';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SubscriptionNotificationService {
    private readonly logger = new Logger(SubscriptionNotificationService.name);

    constructor(private readonly notificationCreation: NotificationCreationService) {}

    async notifyTrialStarted(userId: string, trialEndDate: Date): Promise<void> {
        const endDateStr = trialEndDate.toLocaleDateString('vi-VN');
        await this.notificationCreation.createNotification({
            userId,
            type: NotificationType.SUBSCRIPTION_TRIAL_STARTED,
            title: 'Your free trial has started',
            message: `Welcome! You have 30 days of free trial until ${endDateStr}. Explore all features and subscribe before it ends.`,
            metadata: { trialEndDate: trialEndDate.toISOString() },
            actionUrl: '/subscription/plans',
        });
    }

    async notifyTrialEndingSoon(userId: string, daysLeft: number, trialEndDate: Date): Promise<void> {
        const endDateStr = trialEndDate.toLocaleDateString('vi-VN');
        await this.notificationCreation.createNotification({
            userId,
            type: NotificationType.SUBSCRIPTION_TRIAL_ENDING,
            title: `Trial ending in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
            message: `Your free trial will expire on ${endDateStr}. Subscribe now to keep your access uninterrupted.`,
            metadata: { daysLeft, trialEndDate: trialEndDate.toISOString() },
            actionUrl: '/subscription/plans',
        });
    }

    async notifyTrialExpired(userId: string): Promise<void> {
        await this.notificationCreation.createNotification({
            userId,
            type: NotificationType.SUBSCRIPTION_TRIAL_EXPIRED,
            title: 'Your free trial has expired',
            message: 'Your 30-day free trial has ended. Subscribe to a plan to continue accepting jobs and using the platform.',
            metadata: {},
            actionUrl: '/subscription/plans',
        });
    }

    async notifySubscriptionActivated(userId: string, planName: string, periodEnd: Date): Promise<void> {
        const endDateStr = periodEnd.toLocaleDateString('vi-VN');
        await this.notificationCreation.createNotification({
            userId,
            type: NotificationType.SUBSCRIPTION_ACTIVATED,
            title: 'Subscription activated',
            message: `Your "${planName}" subscription is now active until ${endDateStr}. Thank you!`,
            metadata: { planName, periodEnd: periodEnd.toISOString() },
            actionUrl: '/subscription',
        });
    }

    async notifyRenewalReminder(userId: string, daysLeft: number, periodEnd: Date, planName: string): Promise<void> {
        const endDateStr = periodEnd.toLocaleDateString('vi-VN');
        await this.notificationCreation.createNotification({
            userId,
            type: NotificationType.SUBSCRIPTION_RENEWAL_REMINDER,
            title: `Subscription renews in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
            message: `Your "${planName}" subscription expires on ${endDateStr}. Renew now to avoid any interruption.`,
            metadata: { daysLeft, periodEnd: periodEnd.toISOString(), planName },
            actionUrl: '/subscription/renew',
        });
    }

    async notifySubscriptionExpired(userId: string): Promise<void> {
        await this.notificationCreation.createNotification({
            userId,
            type: NotificationType.SUBSCRIPTION_EXPIRED,
            title: 'Subscription expired',
            message: 'Your subscription has expired. Renew now to continue accepting jobs and using all platform features.',
            metadata: {},
            actionUrl: '/subscription/plans',
        });
    }

    async notifySubscriptionCancelled(userId: string, planName: string): Promise<void> {
        await this.notificationCreation.createNotification({
            userId,
            type: NotificationType.SUBSCRIPTION_CANCELLED,
            title: 'Subscription cancelled',
            message: `Your "${planName}" subscription has been cancelled. You can subscribe again at any time.`,
            metadata: { planName },
            actionUrl: '/subscription/plans',
        });
    }

    async notifyPaymentPending(userId: string, finalAmount: number, planName: string, dueDate: Date): Promise<void> {
        const dueDateStr = dueDate.toLocaleDateString('vi-VN');
        await this.notificationCreation.createNotification({
            userId,
            type: NotificationType.SUBSCRIPTION_PAYMENT_PENDING,
            title: 'Payment awaiting confirmation',
            message: `Your payment of ${finalAmount.toLocaleString('vi-VN')}đ for "${planName}" is pending admin approval. Due date: ${dueDateStr}.`,
            metadata: { finalAmount, planName, dueDate: dueDate.toISOString() },
            actionUrl: '/subscription/payments',
        });
    }

    async notifyPaymentConfirmed(userId: string, finalAmount: number, planName: string): Promise<void> {
        await this.notificationCreation.createNotification({
            userId,
            type: NotificationType.SUBSCRIPTION_PAYMENT_SUCCESS,
            title: 'Payment confirmed',
            message: `Your payment of ${finalAmount.toLocaleString('vi-VN')}đ for "${planName}" has been confirmed. Your subscription is now active.`,
            metadata: { finalAmount, planName },
            actionUrl: '/subscription',
        });
    }
}
