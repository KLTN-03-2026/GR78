import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification } from '../entities/notification.entity';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationCacheService } from './notification-cache.service';
import { NotificationQueryService } from './notification-query.service';

@Injectable()
export class NotificationActionService {
    constructor(
        private readonly notificationRepo: NotificationRepository,
        private readonly queryService: NotificationQueryService,
        private readonly eventEmitter: EventEmitter2,
        private readonly cache: NotificationCacheService,
    ) { }

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        const notification = await this.queryService.findNotification(
            notificationId,
            userId,
        );

        if (notification && !notification.isRead) {
            notification.markAsRead();
            await this.notificationRepo.save(notification);

            await this.cache.invalidateForUser(userId);

            this.eventEmitter.emit('notification.read', {
                userId,
                notificationId,
            });
        }
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepo
            .createQueryBuilder()
            .update(Notification)
            .set({
                isRead: true,
                readAt: new Date(),
            })
            .where('user_id = :userId', { userId })
            .andWhere('is_read = false')
            .execute();

        await this.cache.invalidateForUser(userId);

        this.eventEmitter.emit('notification.all_read', { userId });
    }

    async deleteNotification(
        notificationId: string,
        userId: string,
    ): Promise<void> {
        await this.notificationRepo.delete({ id: notificationId, userId });

        await this.cache.invalidateForUser(userId);

        this.eventEmitter.emit('notification.deleted', {
            userId,
            notificationId,
        });
    }

    async deleteReadNotifications(userId: string): Promise<void> {
        await this.notificationRepo.delete({ userId, isRead: true });

        // Only the list shape changes (read items removed); unread count is unchanged.
        // Bust both anyway — the count re-fetch will return the same value and re-cache cheaply.
        await this.cache.invalidateForUser(userId);

        this.eventEmitter.emit('notification.read_deleted', { userId });
    }
}
