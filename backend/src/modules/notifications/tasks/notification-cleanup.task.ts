import { NOTIFICATION_CONSTANTS } from '../constants/notification.constants';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class NotificationCleanupTask {
    private readonly logger = new Logger(NotificationCleanupTask.name);

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
    ) { }

    
    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async cleanupOldReadNotifications() {
        this.logger.log('Starting cleanup old read notifications...');

        const cutoffDate = new Date();
        cutoffDate.setDate(
            cutoffDate.getDate() - NOTIFICATION_CONSTANTS.DELETE_READ_AFTER_DAYS
        );

        const result = await this.notificationRepo.delete({
            isRead: true,
            readAt: LessThan(cutoffDate),
        });

        this.logger.log(
            `Cleaned up ${result.affected || 0} old read notifications`
        );
    }

    
    @Cron(CronExpression.EVERY_WEEK)
    async cleanupOldUnreadNotifications() {
        this.logger.log('Starting cleanup old unread notifications...');

        const cutoffDate = new Date();
        cutoffDate.setDate(
            cutoffDate.getDate() - NOTIFICATION_CONSTANTS.DELETE_UNREAD_AFTER_DAYS
        );

        const result = await this.notificationRepo.delete({
            isRead: false,
            createdAt: LessThan(cutoffDate),
        });

        this.logger.log(
            `Cleaned up ${result.affected || 0} old unread notifications`
        );
    }
}