import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';

@Injectable()
@WebSocketGateway({
    namespace: 'chat',
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(ChatGateway.name);
    private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>
    private socketUsers = new Map<string, string>(); // socketId -> userId

    constructor(
        private readonly jwtService: JwtService,
        private readonly chatService: ChatService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token =
                client.handshake.auth.token ||
                client.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                client.disconnect();
                return;
            }

            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub || payload.id;

            if (!userId) {
                client.disconnect();
                return;
            }

            // Store connection
            client.data.userId = userId;
            this.socketUsers.set(client.id, userId);

            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId)!.add(client.id);

            await client.join(`user:${userId}`);

            const conversations = await this.chatService.getUserConversations(userId);
            for (const conv of conversations) {
                await client.join(`conversation:${conv.id}`);
            }

            this.logger.log(`Chat client connected: ${client.id} (User: ${userId})`);

            const unreadCount = await this.chatService.getTotalUnreadCount(userId);
            client.emit('connected', { userId, unreadCount });
        } catch (error) {
            this.logger.error('Chat connection error:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = this.socketUsers.get(client.id);

        if (userId) {
            const sockets = this.userSockets.get(userId);
            if (sockets) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                }
            }
            this.socketUsers.delete(client.id);
        }

        this.logger.log(`Chat client disconnected: ${client.id} (User: ${userId})`);
    }

   
    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string; message: SendMessageDto }
    ) {
        try {
            const userId = client.data.userId;
            const message = await this.chatService.sendMessage(
                data.conversationId,
                userId,
                data.message
            );

            return { success: true, message };
        } catch (error: any) {
            this.logger.error('Send message error:', error);
            return { success: false, error: error.message };
        }
    }

    
    @SubscribeMessage('mark_read')
    async handleMarkRead(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string }
    ) {
        try {
            const userId = client.data.userId;
            await this.chatService.markMessagesAsRead(data.conversationId, userId);

            return { success: true };
        } catch (error: any) {
            this.logger.error('Mark read error:', error);
            return { success: false, error: error.message };
        }
    }

    
    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string; isTyping: boolean }
    ) {
        const userId = client.data.userId;

        // Broadcast typing status đến người khác trong conversation
        client.to(`conversation:${data.conversationId}`).emit('user_typing', {
            conversationId: data.conversationId,
            userId,
            isTyping: data.isTyping,
        });
    }

    
    @SubscribeMessage('join_conversation')
    async handleJoinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string }
    ) {
        try {
            const userId = client.data.userId;

            const conversation = await this.chatService.getConversationById(
                data.conversationId,
                userId
            );

            if (conversation) {
                await client.join(`conversation:${data.conversationId}`);
                return { success: true };
            }

            return { success: false, error: 'Not a participant' };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    
    @SubscribeMessage('leave_conversation')
    async handleLeaveConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string }
    ) {
        await client.leave(`conversation:${data.conversationId}`);
        return { success: true };
    }

    
    @OnEvent('message.sent')
    handleMessageSent(payload: {
        conversationId: string;
        message: any;
        receiverId: string;
    }) {
        // Broadcast message đến conversation room
        this.server
            .to(`conversation:${payload.conversationId}`)
            .emit('new_message', {
                conversationId: payload.conversationId,
                message: payload.message,
            });

        // Update unread count cho receiver
        this.server.to(`user:${payload.receiverId}`).emit('unread_updated', {
            conversationId: payload.conversationId,
            increment: 1,
        });

        this.logger.log(
            `Message sent to conversation: ${payload.conversationId}`
        );
    }

    
    @OnEvent('messages.read')
    handleMessagesRead(payload: { conversationId: string; userId: string }) {
        // Notify sender that their messages were read
        this.server.to(`conversation:${payload.conversationId}`).emit('messages_read', {
            conversationId: payload.conversationId,
            readBy: payload.userId,
        });
    }

    
    isUserOnline(userId: string): boolean {
        const sockets = this.userSockets.get(userId);
        return !!sockets && sockets.size > 0;
    }

    
    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }

    
    sendToConversation(conversationId: string, event: string, data: any) {
        this.server.to(`conversation:${conversationId}`).emit(event, data);
    }

    
    getOnlineUsersCount(): number {
        return this.userSockets.size;
    }

    
    getOnlineUsers(): string[] {
        return Array.from(this.userSockets.keys());
    }
}