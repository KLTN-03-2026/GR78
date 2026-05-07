import { CustomRequest } from '@/modules/custom-requests/entities/custom-request.entity';
import { ChatModule } from '@/modules/chat/chat.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { PostCustomer } from '@/modules/posts/entities/post.entity';
import { QuoteRevision } from '@/modules/quotes/entities/quote-revision.entity';
import { Quote } from '@/modules/quotes/entities/quote.entity';
import { QuoteModule } from '@/modules/quotes/quotes.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, Quote, QuoteRevision, PostCustomer, CustomRequest]),
        NotificationsModule,
        ChatModule,
        QuoteModule,
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrdersModule {}
