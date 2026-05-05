import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateNotification } from '../dtos/notification.dto';
import { Notification } from '../entities/notification.entity';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationType } from '../enums/notification.enum';
import { NotificationCacheService } from './notification-cache.service';

@Injectable()
export class NotificationCreationService {
    constructor(
        private readonly notificationRepo: NotificationRepository,
        private readonly eventEmitter: EventEmitter2,
        private readonly cache: NotificationCacheService,
    ) { }

    async createNotification(data: CreateNotification): Promise<Notification> {
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

        // Bust before emitting so any handler that re-reads will get fresh data
        await this.cache.invalidateForUser(data.userId!);

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
        if (notifications.length === 0) return;

        // Pre-generate IDs so we can emit events with complete data before DB confirms
        const now = new Date();
        const entities = notifications.map(notif => ({
            id: randomUUID(),
            userId: notif.userId,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            metadata: notif.metadata,
            actionUrl: notif.actionUrl,
            isRead: false,
            createdAt: now,
        }));

        await this.notificationRepo.insert(entities as Partial<Notification>[]);

        // Bust caches for all affected users in a single parallel pass
        const affectedUserIds = entities.map(e => e.userId);
        await this.cache.invalidateForUsers(affectedUserIds);

        // Emit one event per user for real-time WebSocket delivery
        for (const entity of entities) {
            this.eventEmitter.emit('notification.created', {
                userId: entity.userId,
                notification: entity,
            });
        }
    }
}
