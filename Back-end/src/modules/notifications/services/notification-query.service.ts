import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationQueryService {
    constructor(
        private readonly notificationRepo: NotificationRepository,
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
        const where: any = { userId };
        if (unreadOnly) {
            where.isRead = false;
        }

        const [notifications, total] =
            await this.notificationRepo.findAndCount({
                where,
                order: { createdAt: 'DESC' },
                skip: (page - 1) * limit,
                take: limit,
            });

        const unreadCount = await this.getUnreadCount(userId);

        return { notifications, total, unreadCount };
    }

   
    async getUnreadCount(userId: string): Promise<number> {
        return await this.notificationRepo.count({
            where: { userId, isRead: false },
        });
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