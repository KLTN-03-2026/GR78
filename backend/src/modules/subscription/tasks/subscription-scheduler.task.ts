import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SUBSCRIPTION_CONSTANTS } from '../constants/subscription.constants';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { SubscriptionNotificationService } from '../services/subscription-notification.service';

@Injectable()
export class SubscriptionSchedulerTask {
    private readonly logger = new Logger(SubscriptionSchedulerTask.name);

    constructor(
        private readonly subscriptionRepo: SubscriptionRepository,
        private readonly notificationService: SubscriptionNotificationService,
    ) {}

    /**
     * Runs daily at 08:00. Sends reminder notifications for trials ending in 7, 3, or 1 day.
     */
    @Cron('0 8 * * *')
    async sendTrialEndingReminders(): Promise<void> {
        this.logger.log('Running trial ending reminder job...');

        for (const daysLeft of SUBSCRIPTION_CONSTANTS.RENEWAL_REMINDER_DAYS) {
            const thresholdDate = new Date();
            thresholdDate.setDate(thresholdDate.getDate() + daysLeft);
            thresholdDate.setHours(23, 59, 59, 999);

            const windowStart = new Date(thresholdDate);
            windowStart.setHours(0, 0, 0, 0);

            try {
                const trials = await this.subscriptionRepo.findTrialsExpiringSoon(thresholdDate);

                const relevant = trials.filter(t => {
                    if (!t.trialEndDate) return false;
                    return t.trialEndDate >= windowStart && t.trialEndDate <= thresholdDate;
                });

                for (const sub of relevant) {
                    await this.notificationService
                        .notifyTrialEndingSoon(sub.userId, daysLeft, sub.trialEndDate!)
                        .catch(err =>
                            this.logger.error(
                                `Failed trial reminder for user ${sub.userId}`,
                                err,
                            ),
                        );
                }

                if (relevant.length > 0) {
                    this.logger.log(
                        `Sent trial-ending-in-${daysLeft}-day reminders to ${relevant.length} users`,
                    );
                }
            } catch (err) {
                this.logger.error(`Error in trial reminder job (${daysLeft} days)`, err);
            }
        }
    }

    /**
     * Runs daily at 02:00. Marks expired trials as EXPIRED.
     */
    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async expireTrials(): Promise<void> {
        this.logger.log('Running expire trials job...');

        try {
            const now = new Date();
            const expiredTrials = await this.subscriptionRepo.findExpiredTrials(now);

            if (expiredTrials.length === 0) {
                this.logger.log('No expired trials found');
                return;
            }

            const ids = expiredTrials.map(s => s.id);
            const affected = await this.subscriptionRepo.bulkUpdateStatus(
                ids,
                SubscriptionStatus.EXPIRED,
            );

            this.logger.log(`Marked ${affected} trials as EXPIRED`);

            for (const sub of expiredTrials) {
                await this.notificationService
                    .notifyTrialExpired(sub.userId)
                    .catch(err =>
                        this.logger.error(
                            `Failed trial expired notification for user ${sub.userId}`,
                            err,
                        ),
                    );
            }
        } catch (err) {
            this.logger.error('Error in expire trials job', err);
        }
    }

    /**
     * Runs daily at 09:00. Sends renewal reminders for active subscriptions ending in 7, 3, or 1 day.
     */
    @Cron('0 9 * * *')
    async sendSubscriptionRenewalReminders(): Promise<void> {
        this.logger.log('Running subscription renewal reminder job...');

        for (const daysLeft of SUBSCRIPTION_CONSTANTS.RENEWAL_REMINDER_DAYS) {
            const thresholdDate = new Date();
            thresholdDate.setDate(thresholdDate.getDate() + daysLeft);
            thresholdDate.setHours(23, 59, 59, 999);

            const windowStart = new Date(thresholdDate);
            windowStart.setHours(0, 0, 0, 0);

            try {
                const subscriptions =
                    await this.subscriptionRepo.findSubscriptionsExpiringSoon(thresholdDate);

                const relevant = subscriptions.filter(s => {
                    if (!s.currentPeriodEnd) return false;
                    return s.currentPeriodEnd >= windowStart && s.currentPeriodEnd <= thresholdDate;
                });

                for (const sub of relevant) {
                    if (!sub.autoRenew) continue;
                    const planName = sub.plan?.name ?? 'your plan';
                    await this.notificationService
                        .notifyRenewalReminder(sub.userId, daysLeft, sub.currentPeriodEnd!, planName)
                        .catch(err =>
                            this.logger.error(
                                `Failed renewal reminder for user ${sub.userId}`,
                                err,
                            ),
                        );
                }

                if (relevant.length > 0) {
                    this.logger.log(
                        `Sent renewal-in-${daysLeft}-day reminders to ${relevant.length} users`,
                    );
                }
            } catch (err) {
                this.logger.error(`Error in renewal reminder job (${daysLeft} days)`, err);
            }
        }
    }

    /**
     * Runs daily at 03:00. Marks expired active/past_due subscriptions as EXPIRED.
     */
    @Cron('0 3 * * *')
    async expireSubscriptions(): Promise<void> {
        this.logger.log('Running expire subscriptions job...');

        try {
            const now = new Date();
            const expired = await this.subscriptionRepo.findExpiredSubscriptions(now);

            if (expired.length === 0) {
                this.logger.log('No expired subscriptions found');
                return;
            }

            const ids = expired.map(s => s.id);
            const affected = await this.subscriptionRepo.bulkUpdateStatus(
                ids,
                SubscriptionStatus.EXPIRED,
            );

            this.logger.log(`Marked ${affected} subscriptions as EXPIRED`);

            for (const sub of expired) {
                await this.notificationService
                    .notifySubscriptionExpired(sub.userId)
                    .catch(err =>
                        this.logger.error(
                            `Failed subscription expired notification for user ${sub.userId}`,
                            err,
                        ),
                    );
            }
        } catch (err) {
            this.logger.error('Error in expire subscriptions job', err);
        }
    }
}
