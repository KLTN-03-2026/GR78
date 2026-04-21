
import { NotificationService } from '@/modules/notifications/notification.service';
import { Quote } from '@/modules/quotes/entities/quote.entity';
import { QuoteStatus } from '@/modules/quotes/enums/quote-status.enum';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    GetMessagesQueryDto,
    SendMessageDto
} from './dto/chat.dto';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { Message, MessageType } from './entities/message.entity';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepo: Repository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,
        @InjectRepository(Quote)
        private readonly quoteRepo: Repository<Quote>,
        private readonly notificationService: NotificationService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    

    private readonly SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

    async createConversationFromQuote(quoteId: string): Promise<Conversation> {
        const quote = await this.quoteRepo.findOne({
            where: { id: quoteId },
            relations: ['post', 'post.customer', 'provider'],
        });

        if (!quote) {
            throw new NotFoundException('Quote not found');
        }

        if (quote.status !== QuoteStatus.ACCEPTED_FOR_CHAT) {
            throw new BadRequestException(
                'Quote must be accepted for chat first. Current status: ' + quote.status
            );
        }

        const existing = await this.conversationRepo.findOne({
            where: { quoteId },
        });

        if (existing) {
            this.logger.log(`Conversation already exists for quote ${quoteId}`);
            return existing;
        }

        const conversation = this.conversationRepo.create({
            customerId: quote.post.customerId,
            providerId: quote.providerId,
            quoteId,
            type: ConversationType.QUOTE_BASED,
            isActive: true,
        });

        const saved = await this.conversationRepo.save(conversation);

        await this.sendSystemMessage(
            saved.id,
            `Cuộc trò chuyện bắt đầu từ chào giá được chấp nhận.\n` +
            `Giá hiện tại: ${parseFloat(quote.price.toString()).toLocaleString('vi-VN')}đ\n` +
            `Thời gian ước tính: ${quote.estimatedDuration || 'Chưa xác định'} phút`
        );

        this.logger.log(`Conversation created from quote: ${saved.id}`);
        return saved;
    }

    
    async createDirectConversation(
        customerId: string,
        providerId: string
    ): Promise<Conversation> {
        if (customerId === providerId) {
            throw new BadRequestException('Cannot create conversation with yourself');
        }

        const existing = await this.conversationRepo.findOne({
            where: {
                customerId,
                providerId,
                type: ConversationType.DIRECT_REQUEST,
            },
        });

        if (existing) {
            this.logger.log(`Direct conversation already exists: ${existing.id}`);
            return existing;
        }

        const conversation = this.conversationRepo.create({
            customerId,
            providerId,
            type: ConversationType.DIRECT_REQUEST,
            isActive: true,
        });

        const saved = await this.conversationRepo.save(conversation);



        const systemMessage = this.messageRepo.create({
            conversationId: saved.id,
            senderId: this.SYSTEM_USER_ID,
            type: MessageType.SYSTEM,
            content: 'Cuộc trò chuyện đã được tạo. Hãy thảo luận về yêu cầu dịch vụ của bạn.',
            isRead: false,
        });


        const savedMessage = await this.messageRepo.save(systemMessage);

        saved.lastMessageAt = savedMessage.createdAt;
        await this.conversationRepo.save(saved);

        this.eventEmitter.emit('message.sent', {
            conversationId: saved.id,
            message: savedMessage,
            receiverId: customerId, // Gửi cho khách
        });

        this.eventEmitter.emit('message.sent', {
            conversationId: saved.id,
            message: savedMessage,
            receiverId: providerId, // Gửi cho thợ
        });

        // Gửi notification cho cả 2
        await this.sendNotificationToBoth(saved, savedMessage, customerId, providerId);

        this.logger.log(`Direct conversation created: ${saved.id}`);
        return saved;
    }


    //method


    private async sendNotificationToBoth(
        conversation: Conversation,
        message: Message,
        customerId: string,
        providerId: string
    ): Promise<void> {
        try {
            // Notification cho khách hàng
            this.eventEmitter.emit('notification.send', {
                userId: customerId,
                type: 'NEW_MESSAGE',
                title: 'Cuộc trò chuyện mới',
                body: message.content,
                data: {
                    conversationId: conversation.id,
                    messageId: message.id,
                },
            });

            // Notification cho thợ
            this.eventEmitter.emit('notification.send', {
                userId: providerId,
                type: 'NEW_MESSAGE',
                title: 'Cuộc trò chuyện mới',
                body: message.content,
                data: {
                    conversationId: conversation.id,
                    messageId: message.id,
                },
            });
        } catch (error) {
            this.logger.error('Failed to send notifications', error);
        }
    }




    async sendMessage(
        conversationId: string,
        senderId: string,
        dto: SendMessageDto
    ): Promise<Message> {
        const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId },
            relations: ['customer', 'provider'],
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        if (!conversation.isParticipant(senderId)) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        if (!conversation.isActive) {
            throw new BadRequestException('Conversation is closed');
        }



        const normalizedSenderId =
            senderId === 'system' || senderId === MessageType.SYSTEM
                ? this.SYSTEM_USER_ID
                : senderId;

        if (!conversation.isParticipant(normalizedSenderId) && normalizedSenderId !== this.SYSTEM_USER_ID) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }


        // Validate message content
        this.validateMessageContent(dto);

        // Tạo message
        const message = this.messageRepo.create({
            conversationId,
            senderId,
            type: dto.type,
            content: dto.content?.trim(),
            fileUrls: dto.fileUrls || [],
            fileNames: dto.fileNames,
            isRead: false,
        });

        const saved = await this.messageRepo.save(message);

        // Cập nhật conversation
        await this.updateConversationAfterMessage(conversation, saved, normalizedSenderId);

        // Emit WebSocket event
        this.eventEmitter.emit('message.sent', {
            conversationId,
            message: saved,
            receiverId: conversation.getOtherUserId(normalizedSenderId),
        });

        // Gửi notification
        await this.sendMessageNotification(conversation, saved, normalizedSenderId);

        return saved;
    }

    
    async sendSystemMessage(
        conversationId: string,
        content: string
    ): Promise<Message> {
        const message = this.messageRepo.create({
            conversationId,
            senderId: this.SYSTEM_USER_ID,
            type: MessageType.SYSTEM,
            content,
            isRead: true, // System messages are auto-read
        });

        const saved = await this.messageRepo.save(message);

        // Cập nhật conversation
        await this.conversationRepo.update(conversationId, {
            lastMessageAt: new Date(),
            lastMessagePreview: content,
        });

        // Emit event
        this.eventEmitter.emit('system.message.sent', {
            conversationId,
            message: saved,
        });

        return saved;
    }

    async getUserConversations(userId: string): Promise<Conversation[]> {
        return await this.conversationRepo.find({
            where: [{ customerId: userId }, { providerId: userId }],
            relations: ['customer', 'customer.profile', 'provider', 'provider.profile', 'quote'],
            order: { lastMessageAt: 'DESC' },
        });
    }

    
    async getConversationById(
        conversationId: string,
        userId: string
    ): Promise<Conversation> {
        const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId },
            relations: ['customer', 'customer.profile', 'provider', 'provider.profile', 'quote'],
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        if (!conversation.isParticipant(userId)) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        return conversation;
    }

    async getMessages(
        conversationId: string,
        userId: string,
        query: GetMessagesQueryDto
    ): Promise<{ messages: Message[]; hasMore: boolean }> {
        const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        if (!conversation.isParticipant(userId)) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        const limit = Math.min(query.limit || 50, 100); // Max 100
        const queryBuilder = this.messageRepo
            .createQueryBuilder('message')
            .where('message.conversation_id = :conversationId', { conversationId })
            .orderBy('message.created_at', 'DESC')
            .limit(limit + 1);

        if (query.before) {
            queryBuilder.andWhere('message.created_at < :before', {
                before: new Date(query.before),
            });
        }

        const messages = await queryBuilder
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('sender.profile', 'profile')
            .getMany();

        const hasMore = messages.length > limit;
        if (hasMore) {
            messages.pop();
        }

        return {
            messages: messages.reverse(),
            hasMore,
        };
    }

    
    async markMessagesAsRead(
        conversationId: string,
        userId: string
    ): Promise<void> {
        const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        if (!conversation.isParticipant(userId)) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        // Đánh dấu messages của người khác là đã đọc
        await this.messageRepo
            .createQueryBuilder()
            .update(Message)
            .set({ isRead: true, readAt: new Date() })
            .where('conversation_id = :conversationId', { conversationId })
            .andWhere('sender_id != :userId', { userId })
            .andWhere('sender_id != :system', { system: 'system' })
            .andWhere('is_read = false')
            .execute();

        // Reset unread count
        const isCustomer = userId === conversation.customerId;
        await this.conversationRepo.update(conversationId, {
            ...(isCustomer
                ? { customerUnreadCount: 0 }
                : { providerUnreadCount: 0 }),
        });

        this.eventEmitter.emit('messages.read', {
            conversationId,
            userId,
        });
    }

    
    async closeConversation(
        conversationId: string,
        userId: string
    ): Promise<void> {
        const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        if (!conversation.isParticipant(userId)) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        await this.conversationRepo.update(conversationId, {
            isActive: false,
        });

        await this.sendSystemMessage(
            conversationId,
            'Cuộc trò chuyện đã đóng.'
        );

        this.logger.log(`Conversation closed: ${conversationId}`);
    }

    
    async deleteConversation(
        conversationId: string,
        userId: string
    ): Promise<void> {
        const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        if (!conversation.isParticipant(userId)) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        await this.conversationRepo.delete(conversationId);

        this.logger.log(`Conversation deleted: ${conversationId}`);
    }

    
    async getTotalUnreadCount(userId: string): Promise<number> {
        const result = await this.conversationRepo
            .createQueryBuilder('conversation')
            .select(
                `SUM(CASE 
                    WHEN conversation.customer_id = :userId THEN conversation.customer_unread_count 
                    WHEN conversation.provider_id = :userId THEN conversation.provider_unread_count 
                    ELSE 0 
                END)`,
                'total'
            )
            .where('conversation.customer_id = :userId OR conversation.provider_id = :userId', {
                userId,
            })
            .getRawOne();

        return parseInt(result?.total || '0', 10);
    }

    
    async searchMessages(
        userId: string,
        keyword: string,
        conversationId?: string
    ): Promise<Message[]> {
        if (!keyword || keyword.trim().length < 2) {
            throw new BadRequestException('Keyword must be at least 2 characters');
        }

        const queryBuilder = this.messageRepo
            .createQueryBuilder('message')
            .leftJoin('message.conversation', 'conversation')
            .where(
                '(conversation.customer_id = :userId OR conversation.provider_id = :userId)',
                { userId }
            )
            .andWhere('message.content ILIKE :keyword', {
                keyword: `%${keyword}%`,
            })
            .andWhere('message.type = :type', { type: MessageType.TEXT })
            .orderBy('message.created_at', 'DESC')
            .limit(50);

        if (conversationId) {
            queryBuilder.andWhere('message.conversation_id = :conversationId', {
                conversationId,
            });
        }

        return await queryBuilder
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.conversation', 'conv')
            .getMany();
    }

    // ============ PRIVATE HELPERS ============

    private validateMessageContent(dto: SendMessageDto): void {
        if (dto.type === MessageType.TEXT && !dto.content?.trim()) {
            throw new BadRequestException('Text message cannot be empty');
        }

        if (
            (dto.type === MessageType.IMAGE || dto.type === MessageType.FILE) &&
            (!dto.fileUrls || dto.fileUrls.length === 0)
        ) {
            throw new BadRequestException('File message must have at least one file');
        }

        if (dto.type === MessageType.SYSTEM) {
            throw new BadRequestException('Cannot send system message directly');
        }
    }

    private async updateConversationAfterMessage(
        conversation: Conversation,
        message: Message,
        senderId: string
    ): Promise<void> {
        const isCustomerSender = senderId === conversation.customerId;

        await this.conversationRepo.update(conversation.id, {
            lastMessageAt: new Date(),
            lastMessagePreview: this.getMessagePreview(message),
            ...(isCustomerSender
                ? { providerUnreadCount: () => 'provider_unread_count + 1' }
                : { customerUnreadCount: () => 'customer_unread_count + 1' }),
        });
    }

    private async sendMessageNotification(
        conversation: Conversation,
        message: Message,
        senderId: string
    ): Promise<void> {
        const receiverId = conversation.getOtherUserId(senderId);
        const senderName =
            senderId === conversation.customerId
                ? conversation.customer.profile?.displayName || conversation.customer.profile?.fullName
                : conversation.provider.profile?.displayName || conversation.provider.profile?.fullName;

        await this.notificationService.notifyNewMessage(
            receiverId,
            senderId,
            senderName || 'User',
            this.getMessagePreview(message),
            conversation.id
        );
    }

    private getMessagePreview(message: Message): string {
        switch (message.type) {
            case MessageType.TEXT:
                return message.content?.substring(0, 100) || '';
            case MessageType.IMAGE:
                return 'Hình ảnh';
            case MessageType.FILE:
                return 'File đính kèm';
            case MessageType.SYSTEM:
                return message.content || '';
            default:
                return 'Tin nhắn';
        }
    }
}