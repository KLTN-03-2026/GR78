import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { PostCustomer } from '@/modules/posts/entities/post.entity';
import { PostsModule } from '@/modules/posts/posts.module';
import { User } from '@/modules/users/entities/user.entity';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';
import { QuoteRepository } from './repositories/quote.repository';
import { QuoteNotificationService } from './services/quote-notification.service';
import { QuoteQueryService } from './services/quote-query.service';
import { QuoteStatusService } from './services/quote-status.service';
import { QuoteRevisionService } from './services/quote-revision.service';
import { ChatModule } from '@/modules/chat//chat.module';
import { QuoteRevision } from '@/modules/quotes/entities/quote-revision.entity';


import { QuoteValidationService } from './services/quote-validation.service';


@Module({
    imports: [
        TypeOrmModule.forFeature([Quote, PostCustomer, User,QuoteRevision]),
        NotificationsModule,
        PostsModule,
        UsersModule,
        ChatModule
    ],
    controllers: [QuoteController],
    providers: [
        QuoteRepository,
        QuoteService,
        QuoteValidationService,
        QuoteStatusService,
        QuoteQueryService,
        QuoteNotificationService,QuoteQueryService,QuoteRevisionService
    ],
    exports: [QuoteService, QuoteStatusService,QuoteQueryService,QuoteRevisionService],
})
export class QuoteModule { }