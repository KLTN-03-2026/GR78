import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationGateway } from './gateways/notification.gateway';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationActionService } from './services/notification-action.service';
import { NotificationCacheService } from './services/notification-cache.service';
import { NotificationCreationService } from './services/notification-creation.service';
import { NotificationEventService } from './services/notification-event.service';
import { NotificationQueryService } from './services/notification-query.service';
import { NotificationCleanupTask } from './tasks/notification-cleanup.task';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        NotificationRepository,
        NotificationGateway,
        NotificationCacheService,
        NotificationQueryService,
        NotificationCreationService,
        NotificationActionService,
        NotificationEventService,
        NotificationCleanupTask,
    ],
    exports: [
        NotificationService,
        NotificationRepository,
        NotificationGateway,
        NotificationCacheService,
        NotificationQueryService,
        NotificationCreationService,
        NotificationActionService,
        NotificationEventService,
    ],
})

export class NotificationsModule { }


