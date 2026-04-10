import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationActionService } from './services/notification-action.service';
import { NotificationCreationService } from './services/notification-creation.service';
import { NotificationEventService } from './services/notification-event.service';
import { NotificationQueryService } from './services/notification-query.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        NotificationRepository,
        NotificationsGateway,
        NotificationQueryService,
        NotificationCreationService,
        NotificationActionService,
        NotificationEventService,
    ],
    exports: [
        NotificationService,
        NotificationRepository,
        NotificationsGateway,

        NotificationQueryService,
        NotificationCreationService,
        NotificationActionService,
        NotificationEventService,
    ],
})

export class NotificationsModule { }


