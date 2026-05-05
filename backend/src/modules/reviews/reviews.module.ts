import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { Order } from '@/modules/orders/entities/order.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewRepository } from './repositories/review.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, Order, Profile]),
        NotificationsModule,
    ],
    controllers: [ReviewController],
    providers: [ReviewService, ReviewRepository],
    exports: [ReviewService],
})
export class ReviewsModule {}
