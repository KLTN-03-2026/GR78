import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { Quote } from '@/modules/quotes/entities/quote.entity';
import { User } from '@/modules/users/entities/user.entity';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomRequestController } from './custom-request.controller';
import { CustomRequest } from './entities/custom-request.entity';
import { CustomRequestRepository } from './repositories/custom-request.repository';
import { CustomRequestNotificationService } from './services/custom-request-notification.service';
import { CustomRequestService } from './services/custom-request.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([CustomRequest, User, Quote]),
        NotificationsModule,
        UsersModule,
    ],
    controllers: [CustomRequestController],
    providers: [
        CustomRequestRepository,
        CustomRequestService,
        CustomRequestNotificationService,
    ],
    exports: [CustomRequestService, CustomRequestRepository],
})
export class CustomRequestsModule {}
