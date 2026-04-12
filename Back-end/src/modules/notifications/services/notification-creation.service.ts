import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateNotification } from '../dtos/notification.dto';
import { Notification } from '../entities/notification.entity';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationType } from '../enums/notification.enum';



@Injectable()
export class NotificationCreationService {
    constructor(
        private readonly notificationRepo: NotificationRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }


    async createNotification(data:
        CreateNotification
    ): Promise<Notification> {
        const notification = this.notificationRepo.create({
            userId: data.userId!,
            type: data.type!,
            title: data.title!,
            message: data.message!,
            metadata: data.metadata,
            actionUrl: data.actionUrl,
            isRead: false,
        });

        const saved = await this.notificationRepo.save(notification);

        this.eventEmitter.emit('notification.created', {
            userId: data.userId,
            notification: saved,
        });

        return saved;
    }

    async createBulkNotifications(
        notifications: Array<{
            userId: string;
            type: NotificationType;
            title: string;
            message: string;
            metadata?: Record<string, any>;
            actionUrl?: string;
        }>
    ): Promise<void> {
        const entities = notifications.map(notif =>
            this.notificationRepo.create({
                userId: notif.userId,
                type: notif.type,
                title: notif.title,
                message: notif.message,
                metadata: notif.metadata,
                actionUrl: notif.actionUrl,
                isRead: false,
            })
        );

        await this.notificationRepo.insert(entities);
    }
}