import { Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './enums/notification.enum';
import { QuoteNotificationData } from './interfaces/notification.interface';
import { NotificationActionService } from './services/notification-action.service';
import { NotificationCreationService } from './services/notification-creation.service';
import { NotificationQueryService } from './services/notification-query.service';

@Injectable()
export class NotificationService {
    constructor(
        private readonly queryService: NotificationQueryService,
        private readonly creationService: NotificationCreationService,
        private readonly actionService: NotificationActionService,
    ) { }


    async notifyNewQuote(
        customerId: string,
        data: QuoteNotificationData,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId: customerId,
            type: NotificationType.NEW_QUOTE_RECEIVED,
            title: 'Có báo giá mới',
            message: `${data.providerName} đã gửi báo giá ${data.price?.toLocaleString('vi-VN')}đ cho "${data.postTitle}"`,
            metadata: {
                postId: data.postId,
                quoteId: data.quoteId,
                providerId: data.providerName,
                price: data.price,
            },
            actionUrl: `/posts/${data.postId}/quotes`,
        });
    }


    async notifyQuoteAcceptedForChat(
        providerId: string,
        payload: {
            quoteId: string;
            postId: string;
            postTitle: string;
            customerName: string;
        }
    ): Promise<void> {
        await this.creationService.createNotification({
            userId: providerId,
            type: NotificationType.QUOTE_ACCEPTED_FOR_CHAT,
            title: 'Báo giá được chấp nhận',
            message: `${payload.customerName} đã chấp nhận báo giá của bạn cho "${payload.postTitle}". Hãy vào chat để thảo luận thêm!`,
            metadata: {
                quoteId: payload.quoteId,
                postId: payload.postId,
            },
            actionUrl: `/chat/quote/${payload.quoteId}`,
        });
    }


    async notifyQuoteRevised(
        customerId: string,
        payload: {
            quoteId: string;
            postId: string;
            postTitle: string;
            providerName: string;
            newPrice: number;
            oldPrice?: number | null;
        }
    ): Promise<void> {
        const oldPriceNumber = payload.oldPrice ?? payload.newPrice;
        const priceChange = payload.newPrice - oldPriceNumber;
        const changeText = priceChange > 0 ? 'tăng' : 'giảm';
        const changeAmount = Math.abs(priceChange).toLocaleString('vi-VN');
        const emoji = priceChange > 0 ? '📈' : '📉';

        await this.creationService.createNotification({
            userId: customerId,
            type: NotificationType.QUOTE_REVISED,
            title: `${emoji} Thợ đã cập nhật giá`,
            message: `${payload.providerName} đã ${changeText} giá ${changeAmount}đ cho "${payload.postTitle}". Giá mới: ${payload.newPrice.toLocaleString('vi-VN')}đ`,
            metadata: {
                quoteId: payload.quoteId,
                postId: payload.postId,
                newPrice: payload.newPrice,
                oldPrice: payload.oldPrice,
                priceChange,
            },
            actionUrl: `/chat/quote/${payload.quoteId}`,
        });
    }


    async notifyOrderRequested(
        providerId: string,
        payload: {
            quoteId: string;
            postId: string;
            postTitle: string;
            customerName: string;
            price: number;
            revisionNumber?: number;
            notes?: string;
        }
    ): Promise<void> {
        const revisionText = payload.revisionNumber
            ? ` (Revision ${payload.revisionNumber})`
            : '';

        const notesText = payload.notes
            ? `\nGhi chú: ${payload.notes.substring(0, 100)}`
            : '';

        await this.creationService.createNotification({
            userId: providerId,
            type: NotificationType.ORDER_REQUESTED,
            title: 'Khách hàng muốn đặt đơn',
            message: `${payload.customerName} đã nhấn đặt đơn với giá ${payload.price.toLocaleString('vi-VN')}đ${revisionText} cho "${payload.postTitle}". Hãy xác nhận để bắt đầu làm!${notesText}`,
            metadata: {
                quoteId: payload.quoteId,
                postId: payload.postId,
                price: payload.price,
                revisionNumber: payload.revisionNumber,
                notes: payload.notes,
            },
            actionUrl: `/quotes/${payload.quoteId}`,
        });
    }


    async notifyQuoteRejected(
        providerId: string,
        data: QuoteNotificationData,
    ): Promise<void> {
        const reasonText = data.reason ? `\nLý do: ${data.reason}` : '';

        await this.creationService.createNotification({
            userId: providerId,
            type: NotificationType.QUOTE_REJECTED,
            title: 'Báo giá bị từ chối',
            message: `Báo giá của bạn cho "${data.postTitle}" đã bị từ chối.${reasonText}`,
            metadata: {
                postId: data.postId,
                quoteId: data.quoteId,
                reason: data.reason,
            },
            actionUrl: `/quotes/${data.quoteId}`,
        });
    }


    async notifyQuoteCancelled(
        customerId: string,
        payload: {
            quoteId: string;
            postId: string;
            postTitle: string;
            providerName: string;
            reason?: string;
        }
    ): Promise<void> {
        const reasonText = payload.reason ? `\nLý do: ${payload.reason}` : '';

        await this.creationService.createNotification({
            userId: customerId,
            type: NotificationType.QUOTE_REJECTED,
            title: 'Thợ đã hủy báo giá',
            message: `${payload.providerName} đã hủy báo giá cho "${payload.postTitle}".${reasonText}`,
            metadata: {
                quoteId: payload.quoteId,
                postId: payload.postId,
                reason: payload.reason,
            },
            actionUrl: `/posts/${payload.postId}`,
        });
    }

    // ============ ORDER NOTIFICATIONS ============

    async notifyOrderCreated(
        customerId: string,
        providerId: string,
        orderId: string,
        orderTitle: string,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId: customerId,
            type: NotificationType.ORDER_CREATED,
            title: 'Đơn hàng đã được tạo',
            message: `Thợ đã xác nhận và đơn hàng "${orderTitle}" đã được tạo. Công việc đang được thực hiện!`,
            metadata: { orderId },
            actionUrl: `/orders/${orderId}`,
        });
    }

    async notifyOrderInProgress(
        customerId: string,
        orderId: string,
        orderTitle: string,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId: customerId,
            type: NotificationType.ORDER_IN_PROGRESS,
            title: '🔨 Thợ đã bắt đầu làm',
            message: `Thợ đã bắt đầu thực hiện đơn hàng "${orderTitle}"`,
            metadata: { orderId },
            actionUrl: `/orders/${orderId}`,
        });
    }

    async notifyProviderCompleted(
        customerId: string,
        orderId: string,
        orderTitle: string,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId: customerId,
            type: NotificationType.ORDER_IN_PROGRESS,
            title: 'Thợ đã hoàn thành',
            message: `Thợ đã hoàn thành đơn hàng "${orderTitle}". Vui lòng xác nhận!`,
            metadata: { orderId },
            actionUrl: `/orders/${orderId}`,
        });
    }

    async notifyOrderCompleted(
        userId: string,
        orderId: string,
        orderTitle: string,
        isProvider: boolean,
    ): Promise<void> {
        const message = isProvider
            ? `Đơn hàng "${orderTitle}" đã hoàn thành. Vui lòng chờ thanh toán.`
            : `Đơn hàng "${orderTitle}" đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ!`;

        await this.creationService.createNotification({
            userId,
            type: NotificationType.ORDER_COMPLETED,
            title: 'Đơn hàng hoàn thành',
            message,
            metadata: { orderId, isProvider },
            actionUrl: `/orders/${orderId}`,
        });
    }

    async notifyOrderCancelled(
        userId: string,
        orderId: string,
        orderTitle: string,
        reason: string,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId,
            type: NotificationType.ORDER_CANCELLED,
            title: 'Đơn hàng đã bị hủy',
            message: `Đơn hàng "${orderTitle}" đã bị hủy. Lý do: ${reason}`,
            metadata: { orderId, reason },
            actionUrl: `/orders/${orderId}`,
        });
    }

    async notifyPaymentReceived(
        providerId: string,
        amount: number,
        orderId: string,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId: providerId,
            type: NotificationType.PAYMENT_RECEIVED,
            title: 'Đã nhận thanh toán',
            message: `Bạn đã nhận thanh toán ${amount.toLocaleString('vi-VN')}đ`,
            metadata: { orderId, amount },
            actionUrl: `/orders/${orderId}`,
        });
    }

    // ============ POST NOTIFICATIONS ============

    async notifyPostClosed(
        providerIds: string[],
        postTitle: string,
        postId: string,
    ): Promise<void> {
        for (const providerId of providerIds) {
            await this.creationService.createNotification({
                userId: providerId,
                type: NotificationType.POST_CLOSED,
                title: 'Post đã đóng',
                message: `Post "${postTitle}" mà bạn đã chào giá đã được đóng.`,
                metadata: { postId },
                actionUrl: `/posts/${postId}`,
            });
        }
    }

    // ============ REVIEW NOTIFICATIONS ============

    async notifyNewReview(
        providerId: string,
        reviewId: string,
        rating: number,
        customerName: string,
    ): Promise<void> {
        const stars = 'sao'.repeat(rating);

        await this.creationService.createNotification({
            userId: providerId,
            type: NotificationType.NEW_REVIEW_RECEIVED,
            title: 'Đánh giá mới',
            message: `${customerName} đã đánh giá bạn ${stars} (${rating}/5)`,
            metadata: { reviewId, rating },
            actionUrl: `/reviews/${reviewId}`,
        });
    }

    // ============ MESSAGE NOTIFICATIONS ============

    async notifyNewMessage(
        userId: string,
        senderId: string,
        senderName: string,
        messagePreview: string,
        chatId: string,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId,
            type: NotificationType.NEW_MESSAGE,
            title: 'Tin nhắn mới',
            message: `${senderName}: ${messagePreview.substring(0, 100)}`,
            metadata: { senderId, chatId },
            actionUrl: `/chats/${chatId}`,
        });
    }

    // ============ SYSTEM NOTIFICATIONS ============

    async notifySystem(
        userIds: string[],
        title: string,
        message: string,
        metadata?: Record<string, any>,
    ): Promise<void> {
        for (const userId of userIds) {
            await this.creationService.createNotification({
                userId,
                type: NotificationType.SYSTEM_ANNOUNCEMENT,
                title,
                message,
                metadata,
            });
        }
    }

    // ============ QUERY METHODS ============

    async getUserNotifications(
        userId: string,
        page: number = 1,
        limit: number = 20,
        unreadOnly: boolean = false,
    ): Promise<{
        notifications: Notification[];
        total: number;
        unreadCount: number;
    }> {
        return await this.queryService.getUserNotifications(
            userId,
            page,
            limit,
            unreadOnly,
        );
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await this.queryService.getUnreadCount(userId);
    }

    // ============ ACTION METHODS ============

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        await this.actionService.markAsRead(notificationId, userId);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.actionService.markAllAsRead(userId);
    }

    async deleteNotification(
        notificationId: string,
        userId: string,
    ): Promise<void> {
        await this.actionService.deleteNotification(notificationId, userId);
    }

    async deleteReadNotifications(userId: string): Promise<void> {
        await this.actionService.deleteReadNotifications(userId);
    }
}