import { NotificationService } from '@/modules/notifications/notification.service';
import { PostCustomer } from '@/modules/posts/entities/post.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Quote } from '../entities/quote.entity';

@Injectable()
export class QuoteNotificationService {
    private readonly logger = new Logger(QuoteNotificationService.name);

    constructor(
        private readonly notificationService: NotificationService,
    ) { }


    async notifyNewQuote(
        customerId: string,
        quote: Quote,
        provider: User,
        post: PostCustomer,
    ): Promise<void> {
        try {
            await this.notificationService.notifyNewQuote(customerId, {
                postId: post.id,
                quoteId: quote.id,
                providerName: provider.profile?.fullName || 'Thợ',
                price: parseFloat(quote.price.toString()),
                postTitle: post.title,
            });
        } catch {
            this.logger.error(`Failed to notify new quote:`);
        }
    }


    async notifyQuoteAcceptedForChat(
        quote: Quote,
        customerId: string
    ): Promise<void> {
        try {
            const customerName = quote.post.customer?.profile?.fullName || 'Khách hàng';

            await this.notificationService.notifyQuoteAcceptedForChat(
                quote.providerId,
                {
                    quoteId: quote.id,
                    postId: quote.postId,
                    postTitle: quote.post.title,
                    customerName,
                }
            );
        } catch {
            this.logger.error(`Failed to notify quote accepted for chat: `);
        }
    }


    async notifyQuoteRevised(
        quote: Quote,
        customerId: string,
        oldPrice?: number | null,
    ): Promise<void> {
        try {
            const providerName = quote.provider?.profile?.fullName || 'Thợ';
            const newPrice = parseFloat(quote.price.toString());

            await this.notificationService.notifyQuoteRevised(
                customerId,
                {
                    quoteId: quote.id,
                    postId: quote.postId,
                    postTitle: quote.post.title,
                    providerName,
                    newPrice,
                    oldPrice,
                }
            );
        } catch {
            this.logger.error(`Failed to notify quote revised:`);
        }
    }


    async notifyOrderRequested(
        quote: Quote,
        customerId: string,
        revisionNumber?: number,
        notes?: string,
    ): Promise<void> {
        try {
            const customerName = quote.post.customer?.profile?.fullName || 'Khách hàng';

            await this.notificationService.notifyOrderRequested(
                quote.providerId,
                {
                    quoteId: quote.id,
                    postId: quote.postId,
                    postTitle: quote.post.title,
                    customerName,
                    price: parseFloat(quote.price.toString()),
                    revisionNumber,
                    notes,
                }
            );
        } catch {
            this.logger.error(`Failed to notify order requested: `);
        }
    }


    async notifyQuoteRejected(quote: Quote, reason?: string): Promise<void> {
        try {
            await this.notificationService.notifyQuoteRejected(quote.providerId, {
                quoteId: quote.id,
                postId: quote.postId,
                postTitle: quote.post.title,
                reason,
            });
        } catch {
            this.logger.error(`Failed to notify quote rejected:`);
        }
    }

    async notifyQuoteCancelled(
        quote: Quote,
        customerId: string,
        reason?: string,
    ): Promise<void> {
        try {
            const providerName = quote.provider?.profile?.fullName || 'Thợ';

            await this.notificationService.notifyQuoteCancelled(
                customerId,
                {
                    quoteId: quote.id,
                    postId: quote.postId,
                    postTitle: quote.post.title,
                    providerName,
                    reason,
                }
            );
        } catch {
            this.logger.error(`Failed to notify quote cancelled:`);
        }
    }
}