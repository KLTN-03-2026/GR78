
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
} from './dtos/chat.dto';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { Message, MessageType } from './entities/message.entity';
import { ChatCacheService } from './services/chat-cache.service';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    // Sentinel UUID for system-generated messages (not a real user)
    private readonly SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepo: Repository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,
        @InjectRepository(Quote)
        private readonly quoteRepo: Repository<Quote>,
        private readonly notificationService: NotificationService,
        private readonly eventEmitter: EventEmitter2,
        private readonly chatCache: ChatCacheService,
    ) { }

    // ============ CONVERSATION CREATION ============

    async createConversationFromQuote(quoteId: string): Promise<Conversation> {
        const quote = await this.quoteRepo.findOne({
            where: { id: quoteId },
            relations: ['post', 'post.customer', 'provider', 'customRequest'],
        });

        if (!quote) {
            throw new NotFoundException('Quote not found');
        }

        if (quote.status !== QuoteStatus.ACCEPTED_FOR_CHAT) {
            throw new BadRequestException(
                'Quote must be accepted for chat first. Current status: ' + quote.status
            );
        }

        const customerId = quote.post?.customerId ?? quote.customRequest?.customerId;
        if (!customerId) {
            throw new BadRequestException('Cannot determine customer for this quote');
        }

        const providerId = quote.providerId;
        const contextTitle = quote.customRequest?.title ?? quote.post?.title ?? 'Yêu cầu dịch vụ';
        const systemMsg =
            `Báo giá được chấp nhận.\n` +
            `Yêu cầu: ${contextTitle}\n` +
            `Giá: ${parseFloat(quote.price.toString()).toLocaleString('vi-VN')}đ\n` +
            `Thời gian ước tính: ${quote.estimatedDuration || 'Chưa xác định'} phút`;

        const existing = await this.findConversationBetween(customerId, providerId);
        if (existing) {
            this.logger.log(`Reusing conversation ${existing.id} for quote ${quoteId}`);
            await this.ensureActive(existing);
            await this.sendSystemMessage(existing.id, systemMsg, { customerId, providerId });
            return existing;
        }

        const isDirectRequest = !!quote.customRequestId;
        const conversation = this.conversationRepo.create({
            customerId,
            providerId,
            quoteId,
            type: isDirectRequest ? ConversationType.DIRECT_REQUEST : ConversationType.QUOTE_BASED,
            isActive: true,
        });

        try {
            const saved = await this.conversationRepo.save(conversation);
            await this.chatCache.invalidateOnNewConversation(customerId, providerId);
            await this.sendSystemMessage(saved.id, systemMsg, { customerId, providerId });
            this.logger.log(`Conversation created from quote: ${saved.id}`);
            return saved;
        } catch (err: any) {
            if (err?.code === '23505') {
                const winner = await this.findConversationBetween(customerId, providerId);
                if (winner) {
                    this.logger.warn(`Race condition resolved: reusing conversation ${winner.id}`);
                    await this.sendSystemMessage(winner.id, systemMsg, { customerId, providerId });
                    return winner;
                }
            }
            throw err;
        }
    }

    async createDirectConversation(
        customerId: string,
        providerId: string,
    ): Promise<Conversation> {
        if (customerId === providerId) {
            throw new BadRequestException('Cannot create conversation with yourself');
        }

        const existing = await this.findConversationBetween(customerId, providerId);
        if (existing) {
            this.logger.log(`Conversation already exists between users: ${existing.id}`);
            await this.ensureActive(existing);
            return existing;
        }

        const conversation = this.conversationRepo.create({
            customerId,
            providerId,
            type: ConversationType.DIRECT_REQUEST,
            isActive: true,
        });

        try {
            const saved = await this.conversationRepo.save(conversation);

            await this.chatCache.invalidateOnNewConversation(customerId, providerId);

            await this.sendSystemMessage(
                saved.id,
                'Cuộc trò chuyện đã được tạo. Hãy thảo luận về yêu cầu dịch vụ của bạn.',
                { customerId, providerId },
            );

            await this.notificationService.notifyNewMessage(
                providerId,
                customerId,
                'Khách hàng',
                'Cuộc trò chuyện mới đã được tạo',
                saved.id,
            );

            this.logger.log(`Direct conversation created: ${saved.id}`);
            return saved;
        } catch (err: any) {
            // PostgreSQL unique-constraint violation (23505): concurrent inserts both
            // passed the app-level check above.  Return the winner row instead.
            if (err?.code === '23505') {
                const winner = await this.findConversationBetween(customerId, providerId);
                if (winner) {
                    this.logger.warn(
                        `Race condition resolved: reusing conversation ${winner.id} (${customerId}, ${providerId})`,
                    );
                    return winner;
                }
            }
            throw err;
        }
    }

    async createOrderConversation(
        orderId: string,
        customerId: string,
        providerId: string,
        orderTitle: string,
    ): Promise<Conversation> {
        const systemMsg =
            `Đơn hàng "${orderTitle}" đã hoàn thành!\n` +
            `Bạn có thể dùng cuộc trò chuyện này để liên lạc thêm, trao đổi về bảo hành, hoặc đánh giá dịch vụ.`;

        const existing = await this.findConversationBetween(customerId, providerId);
        if (existing) {
            this.logger.log(`Reusing conversation ${existing.id} for order ${orderId}`);
            await this.ensureActive(existing);
            await this.sendSystemMessage(existing.id, systemMsg, { customerId, providerId });
            return existing;
        }

        const conversation = this.conversationRepo.create({
            customerId,
            providerId,
            orderId,
            type: ConversationType.ORDER_CHAT,
            isActive: true,
        });

        try {
            const saved = await this.conversationRepo.save(conversation);
            await this.chatCache.invalidateOnNewConversation(customerId, providerId);
            await this.sendSystemMessage(saved.id, systemMsg, { customerId, providerId });
            this.logger.log(`Order conversation created: ${saved.id} for order ${orderId}`);
            return saved;
        } catch (err: any) {
            if (err?.code === '23505') {
                const winner = await this.findConversationBetween(customerId, providerId);
                if (winner) {
                    this.logger.warn(`Race condition resolved: reusing conversation ${winner.id}`);
                    await this.sendSystemMessage(winner.id, systemMsg, { customerId, providerId });
                    return winner;
                }
            }
            throw err;
        }
    }

    /** Returns the single conversation between a customer and provider, or null. */
    private async findConversationBetween(
        customerId: string,
        providerId: string,
    ): Promise<Conversation | null> {
        return this.conversationRepo.findOne({ where: { customerId, providerId } });
    }

    /**
     * Reopens a closed conversation so it can receive new messages.
     * Mutates the in-memory object so callers don't need to reload from DB.
     */
    private async ensureActive(conversation: Conversation): Promise<void> {
        if (!conversation.isActive) {
            await this.conversationRepo.update(conversation.id, { isActive: true });
            conversation.isActive = true;
        }
    }

    // ============ MESSAGING ============

    async sendMessage(
        conversationId: string,
        senderId: string,
        dto: SendMessageDto
    ): Promise<Message> {
        // Load profile relations so sendMessageNotification can read the sender's display name
        const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId },
            relations: ['customer', 'customer.profile', 'provider', 'provider.profile'],
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

        this.validateMessageContent(dto);

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

        await this.updateConversationAfterMessage(conversation, saved, senderId);

        // Invalidate after DB is fully updated so the next cache population is fresh
        await this.chatCache.invalidateOnNewMessage(
            conversationId,
            conversation.customerId,
            conversation.providerId,
        );

        this.eventEmitter.emit('message.sent', {
            conversationId,
            message: saved,
            receiverId: conversation.getOtherUserId(senderId),
        });

        await this.sendMessageNotification(conversation, saved, senderId);

        return saved;
    }

    /**
     * Sends a system message and busts all caches for this conversation.
     *
     * @param participants - If provided, also busts participant-scoped caches
     *   (conversation list pages, unread counts). Pass this whenever the surrounding
     *   operation has the customerId/providerId available.
     */
    async sendSystemMessage(
        conversationId: string,
        content: string,
        participants?: { customerId: string; providerId: string },
    ): Promise<Message> {
        const message = this.messageRepo.create({
            conversationId,
            senderId: this.SYSTEM_USER_ID,
            type: MessageType.SYSTEM,
            content,
            isRead: true,
        });

        const saved = await this.messageRepo.save(message);

        await this.conversationRepo.update(conversationId, {
            lastMessageAt: new Date(),
            lastMessagePreview: content,
        });

        this.eventEmitter.emit('system.message.sent', {
            conversationId,
            message: saved,
        });

        if (participants) {
            await this.chatCache.invalidateOnNewMessage(
                conversationId,
                participants.customerId,
                participants.providerId,
            );
        } else {
            // Minimal bust when participants are unknown — TTL handles the rest
            await Promise.all([
                this.chatCache.invalidatePattern(`svc:chat:v1:msgs:${conversationId}:*`),
                this.chatCache.del(this.chatCache.keyConversationDetail(conversationId)),
            ]);
        }

        return saved;
    }

    // ============ QUERIES ============

    /**
     * Lightweight query used by the WebSocket gateway to join conversation rooms on connect.
     * Returns only IDs — no relation loading.
     * Cached with a 60-second TTL; newly created conversations are joined on demand
     * via the join_conversation socket event.
     */
    async getConversationIds(userId: string): Promise<string[]> {
        const key = this.chatCache.keyConversationIds(userId);

        const cached = await this.chatCache.get<string[]>(key);
        if (cached) return cached;

        const rows = await this.conversationRepo.find({
            select: { id: true },
            where: [{ customerId: userId }, { providerId: userId }],
        });
        const ids = rows.map(r => r.id);

        await this.chatCache.set(key, ids, this.chatCache.ttl.CONVERSATION_IDS);
        return ids;
    }

    async getUserConversations(
        userId: string,
        page: number = 1,
        limit: number = 20,
    ): Promise<{ conversations: Conversation[]; total: number }> {
        const key = this.chatCache.keyConversationList(userId, page, limit);

        const cached = await this.chatCache.get<{ conversations: Conversation[]; total: number }>(key);
        if (cached) return cached;

        const [conversations, total] = await this.conversationRepo.findAndCount({
            where: [{ customerId: userId }, { providerId: userId }],
            relations: ['customer', 'customer.profile', 'provider', 'provider.profile'],
            order: { lastMessageAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const result = { conversations, total };
        await this.chatCache.set(key, result, this.chatCache.ttl.CONVERSATION_LIST);
        return result;
    }

    async getConversationById(
        conversationId: string,
        userId: string
    ): Promise<Conversation> {
        const key = this.chatCache.keyConversationDetail(conversationId);

        const cached = await this.chatCache.get<{ customerId: string; providerId: string } & Record<string, unknown>>(key);
        if (cached) {
            // Plain objects from cache lack entity methods; check participant fields directly
            if (cached.customerId !== userId && cached.providerId !== userId) {
                throw new ForbiddenException('You are not a participant in this conversation');
            }
            return cached as unknown as Conversation;
        }

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

        await this.chatCache.set(key, conversation, this.chatCache.ttl.CONVERSATION_DETAIL);
        return conversation;
    }

    async getMessages(
        conversationId: string,
        userId: string,
        query: GetMessagesQueryDto
    ): Promise<{ messages: Message[]; hasMore: boolean }> {
        // Participant check — lightweight PK lookup, no relation loading
        const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        if (!conversation.isParticipant(userId)) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        const limit = Math.min(query.limit || 50, 100);
        const key = this.chatCache.keyMessages(conversationId, limit, query.before);

        // Message pages are shared across participants (same data, access guarded above)
        const cached = await this.chatCache.get<{ messages: Message[]; hasMore: boolean }>(key);
        if (cached) return cached;

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

        const result = { messages: messages.reverse(), hasMore };

        // Historical pages (cursor-anchored) are immutable; latest page needs shorter TTL
        const ttl = query.before
            ? this.chatCache.ttl.MESSAGES_HISTORY
            : this.chatCache.ttl.MESSAGES_LATEST;
        await this.chatCache.set(key, result, ttl);

        return result;
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

        // Mark messages sent by the OTHER participant as read (exclude system messages)
        await this.messageRepo
            .createQueryBuilder()
            .update(Message)
            .set({ isRead: true, readAt: new Date() })
            .where('conversation_id = :conversationId', { conversationId })
            .andWhere('sender_id != :userId', { userId })
            .andWhere('sender_id != :systemId', { systemId: this.SYSTEM_USER_ID })
            .andWhere('is_read = false')
            .execute();

        const isCustomer = userId === conversation.customerId;
        await this.conversationRepo.update(conversationId, {
            ...(isCustomer
                ? { customerUnreadCount: 0 }
                : { providerUnreadCount: 0 }),
        });

        await this.chatCache.invalidateOnMessagesRead(conversationId, userId);

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

        await this.conversationRepo.update(conversationId, { isActive: false });

        await this.sendSystemMessage(
            conversationId,
            'Cuộc trò chuyện đã đóng.',
            { customerId: conversation.customerId, providerId: conversation.providerId },
        );

        await this.chatCache.invalidateOnConversationChange(
            conversationId,
            conversation.customerId,
            conversation.providerId,
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

        // Invalidate before deletion so the DEL keys still exist (avoids SCAN on ghost keys)
        await this.chatCache.invalidateOnConversationChange(
            conversationId,
            conversation.customerId,
            conversation.providerId,
        );

        await this.conversationRepo.delete(conversationId);

        this.logger.log(`Conversation deleted: ${conversationId}`);
    }

    async getTotalUnreadCount(userId: string): Promise<number> {
        const key = this.chatCache.keyUnreadCount(userId);

        // Must use !== null because 0 is a valid cached value (falsy in JS)
        const cached = await this.chatCache.get<number>(key);
        if (cached !== null) return cached;

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

        const count = parseInt(result?.total || '0', 10);
        await this.chatCache.set(key, count, this.chatCache.ttl.UNREAD_COUNT);
        return count;
    }

    async searchMessages(
        userId: string,
        keyword: string,
        conversationId?: string
    ): Promise<Message[]> {
        if (!keyword || keyword.trim().length < 2) {
            throw new BadRequestException('Keyword must be at least 2 characters');
        }

        // Escape ILIKE wildcards to prevent a bare '%' from matching everything (performance DoS)
        const escaped = keyword.trim().replace(/[\\%_]/g, '\\$&');

        const queryBuilder = this.messageRepo
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.conversation', 'conversation')
            .leftJoinAndSelect('message.sender', 'sender')
            .where(
                '(conversation.customer_id = :userId OR conversation.provider_id = :userId)',
                { userId }
            )
            .andWhere('message.content ILIKE :keyword', { keyword: `%${escaped}%` })
            .andWhere('message.type = :type', { type: MessageType.TEXT })
            .orderBy('message.created_at', 'DESC')
            .limit(50);

        if (conversationId) {
            queryBuilder.andWhere('message.conversation_id = :conversationId', {
                conversationId,
            });
        }

        return await queryBuilder.getMany();
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

        const senderProfile =
            senderId === conversation.customerId
                ? conversation.customer?.profile
                : conversation.provider?.profile;

        const senderName =
            senderProfile?.displayName ||
            senderProfile?.fullName ||
            'Người dùng';

        await this.notificationService.notifyNewMessage(
            receiverId,
            senderId,
            senderName,
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
