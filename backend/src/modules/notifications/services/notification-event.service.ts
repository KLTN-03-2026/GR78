
import { Injectable } from '@nestjs/common';
import { NotificationType } from '../enums/notification.enum';
import { QuoteNotificationData } from '../interfaces/notification.interface';
import { NotificationCreationService } from './notification-creation.service';

@Injectable()
export class NotificationEventService {
    constructor(
        private readonly creationService: NotificationCreationService,
    ) { }

    async notifyNewQuote(
        customerId: string,
        data: QuoteNotificationData,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId: customerId,
            type: NotificationType.NEW_QUOTE_RECEIVED,
            title: 'new quote',
            message: `${data.providerName} sent a quote ${data.price?.toLocaleString('vi-VN')}đ for post "${data.postTitle}"`,
            metadata: {
                postId: data.postId,
                quoteId: data.quoteId,
                providerId: data.providerName,
                price: data.price,
            },
            actionUrl: `/posts/${data.postId}/quotes`,
        });
    }

    async notifyQuoteAccepted(
        providerId: string,
        data: QuoteNotificationData,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId: providerId,
            type: NotificationType.QUOTE_ACCEPTED,
            title: 'Quote accepted',
            message: `Happy! Your quote for "${data.postTitle}" has been accepted`,
            metadata: {
                postId: data.postId,
                quoteId: data.quoteId,
            },
            actionUrl: `/quotes/${data.quoteId}`,
        });
    }

    async notifyQuoteRejected(
        providerId: string,
        data: QuoteNotificationData,
    ): Promise<void> {
        const reasonText = data.reason ? `: ${data.reason}` : '';

        await this.creationService.createNotification({
            userId: providerId,
            type: NotificationType.QUOTE_REJECTED,
            title: 'Quote was rejected',
            message: `Your quote for "${data.postTitle}" has been rejected${reasonText}`,
            metadata: {
                postId: data.postId,
                quoteId: data.quoteId,
                reason: data.reason,
            },
            actionUrl: `/quotes/${data.quoteId}`,
        });
    }

    async notifyPostClosed(
        providerIds: string[],
        postTitle: string,
        postId: string,
    ): Promise<void> {
        await Promise.all(
            providerIds.map(providerId =>
                this.creationService.createNotification({
                    userId: providerId,
                    type: NotificationType.POST_CLOSED,
                    title: 'Post is closed',
                    message: `Post "${postTitle}" you bid on has been closed.`,
                    metadata: { postId },
                    actionUrl: `/posts/${postId}`,
                })
            )
        );
    }

    async notifyOrderCreated(
        providerId: string,
        customerId: string,
        orderId: string,
        orderTitle: string,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId: providerId,
            type: NotificationType.ORDER_CREATED,
            title: 'new order',
            message: `you have new order: "${orderTitle}"`,
            metadata: { orderId },
            actionUrl: `/orders/${orderId}`,
        });

        await this.creationService.createNotification({
            userId: customerId,
            type: NotificationType.ORDER_CREATED,
            title: 'Order has been created',
            message: `Order "${orderTitle}" was created successfully`,
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
            title: 'Order in progress',
            message: `Provider has started working on order: "${orderTitle}"`,
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
            title: 'Provider completed work',
            message: `Provider has completed order: "${orderTitle}". Please confirm!`,
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
            ? `Order "${orderTitle}" has been completed. Please wait for payment.`
            : `Order "${orderTitle}" has been completed. Thank you for using our service!`;

        await this.creationService.createNotification({
            userId,
            type: NotificationType.ORDER_COMPLETED,
            title: 'Order completed',
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
            title: 'Order cancelled',
            message: `Order "${orderTitle}" has been cancelled. Reason: ${reason}`,
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
            title: 'Payment received',
            message: `You have received payment of ${amount.toLocaleString('vi-VN')} VNĐ`,
            metadata: { orderId, amount },
            actionUrl: `/orders/${orderId}`,
        });
    }

    async notifyNewReview(
        providerId: string,
        reviewId: string,
        rating: number,
        customerName: string,
    ): Promise<void> {
        await this.creationService.createNotification({
            userId: providerId,
            type: NotificationType.NEW_REVIEW_RECEIVED,
            title: 'New review',
            message: `${customerName} rated you ${rating} star`,
            metadata: { reviewId, rating },
            actionUrl: `/reviews/${reviewId}`,
        });
    }

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
            title: 'New message',
            message: `${senderName}: ${messagePreview}`,
            metadata: { senderId, chatId },
            actionUrl: `/chats/${chatId}`,
        });
    }

    async notifySystem(
        userIds: string[],
        title: string,
        message: string,
        metadata?: Record<string, any>,
    ): Promise<void> {
        await Promise.all(
            userIds.map(userId =>
                this.creationService.createNotification({
                    userId,
                    type: NotificationType.SYSTEM_ANNOUNCEMENT,
                    title,
                    message,
                    metadata,
                })
            )
        );
    }
}