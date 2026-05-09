import { CommonModule } from '@/common/common.module';
import { AppConfigModule } from '@/config/config.module';
import { TypeOrmDatabaseModule } from '@/database/typeorm.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CertificationModule } from '@/modules/certifications/certification.module';
import { ChatModule } from '@/modules/chat/chat.module';
import { CustomRequestsModule } from '@/modules/custom-requests/custom-requests.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { PostsModule } from '@/modules/posts/posts.module';
import { ProfileModule } from '@/modules/profile/profile.module';
import { QuoteModule } from '@/modules/quotes/quotes.module';
import { RedisModule } from '@/modules/redis/redis.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';
import { SearchModule } from '@/modules/search/search.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AppConfigModule,
    TypeOrmDatabaseModule,
    RedisModule,
    AuthModule,
    PostsModule,
    CommonModule,
    ProfileModule,
    NotificationsModule,
    QuoteModule,
    ChatModule,
    OrdersModule,
    SearchModule,
    CustomRequestsModule,
    ReviewsModule,
    CertificationModule,
    SubscriptionModule,
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
