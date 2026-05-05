import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationCacheService } from './notification-cache.service';

@Injectable()
export class NotificationQueryService {
    constructor(
        private readonly notificationRepo: NotificationRepository,
        private readonly cache: NotificationCacheService,
    ) { }

    async getUserNotifications(
        userId: string,
        page: number = 1,
        limit: number = 20,
        unreadOnly: boolean = false,
    ): Promise<{
        notifications: Notification[];
        total: number;
        unreadCount: number;
    }> {
        const key = this.cache.keyList(userId, page, limit, unreadOnly);

        const cached = await this.cache.get<{
            notifications: Notification[];
            total: number;
            unreadCount: number;
        }>(key);
        if (cached) return cached;

        const where: any = { userId };
        if (unreadOnly) {
            where.isRead = false;
        }

        const [[notifications, total], unreadCount] = await Promise.all([
            this.notificationRepo.findAndCount({
                where,
                order: { createdAt: 'DESC' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            // getUnreadCount has its own cache layer so this is often a cache hit
            this.getUnreadCount(userId),
        ]);

        const result = { notifications, total, unreadCount };
        await this.cache.set(key, result, this.cache.ttl.LIST);
        return result;
    }

    async getUnreadCount(userId: string): Promise<number> {
        const key = this.cache.keyUnreadCount(userId);

        // Must use !== null — 0 is a valid cached value (falsy in JS)
        const cached = await this.cache.get<number>(key);
        if (cached !== null) return cached;

        const count = await this.notificationRepo.count({
            where: { userId, isRead: false },
        });

        await this.cache.set(key, count, this.cache.ttl.UNREAD_COUNT);
        return count;
    }

    async findNotification(
        notificationId: string,
        userId: string,
    ): Promise<Notification | null> {
        return await this.notificationRepo.findOne({
            where: { id: notificationId, userId },
        });
    }
}
