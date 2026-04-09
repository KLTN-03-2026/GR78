import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
    namespace: 'notifications',
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        credentials: true,
    },
})
export class NotificationsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    private userSockets = new Map<string, Set<string>>(); 

    constructor(private readonly jwtService: JwtService) { }

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

            
            client.data.userId = userId;

            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId)!.add(client.id);

            
            await client.join(`user:${userId}`);

            this.logger.log(
                `Client connected: ${client.id} (User: ${userId})`,
            );

            
            client.emit('connected', { userId });
        } catch (error) {
            this.logger.error('Connection error:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;

        if (userId) {
            const sockets = this.userSockets.get(userId);
            if (sockets) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                }
            }
        }

        this.logger.log(
            `Client disconnected: ${client.id} (User: ${userId})`,
        );
    }

    
    @OnEvent('notification.created')
    handleNotificationCreated(payload: { userId: string; notification: any }) {
        this.server
            .to(`user:${payload.userId}`)
            .emit('notification:new', payload.notification);

        this.logger.log(`Notification sent to user: ${payload.userId}`);
    }

   
    @OnEvent('notification.read')
    handleNotificationRead(payload: {
        userId: string;
        notificationId: string;
    }) {
        this.server
            .to(`user:${payload.userId}`)
            .emit('notification:read', {
                notificationId: payload.notificationId,
            });
    }

    
    @OnEvent('notification.all_read')
    handleAllNotificationsRead(payload: { userId: string }) {
        this.server
            .to(`user:${payload.userId}`)
            .emit('notification:all_read', {});
    }

   
    isUserOnline(userId: string): boolean {
        const sockets = this.userSockets.get(userId);
        return !!sockets && sockets.size > 0;
    }

    
    getUserConnectionCount(userId: string): number {
        return this.userSockets.get(userId)?.size || 0;
    }

    
    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }

   
    broadcastToAll(event: string, data: any) {
        this.server.emit(event, data);
    }
}