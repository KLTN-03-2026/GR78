import { CustomRequest } from '@/modules/custom-requests/entities/custom-request.entity';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { Quote } from '@/modules/quotes/entities/quote.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ChatCacheService } from './services/chat-cache.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, Message, Quote, CustomRequest]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '7d' },
        }),
        NotificationsModule,
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, ChatCacheService],
    exports: [ChatService, ChatGateway, ChatCacheService],
})
export class ChatModule { }