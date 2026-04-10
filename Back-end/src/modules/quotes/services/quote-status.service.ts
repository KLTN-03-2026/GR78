import { ChatService } from '@/modules/chat/chat.service';
import { PostRepository } from '@/modules/posts/repositories/post.repository';
import { Injectable, Logger } from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
import { Quote } from '../entities/quote.entity';
import { QuoteStatus } from '../enums/quote-status.enum';
import { QuoteRepository } from '../repositories/quote.repository';
import { QuoteNotificationService } from './quote-notification.service';
import { QuoteRevisionService } from './quote-revision.service';

@Injectable()
export class QuoteStatusService {
    private readonly logger = new Logger(QuoteStatusService.name);

    constructor(
        private readonly quoteRepo: QuoteRepository,
        private readonly postRepo: PostRepository,
        private readonly revisionService: QuoteRevisionService,
        private readonly notificationService: QuoteNotificationService,
        private readonly chatService: ChatService,
    ) { }

    
    async acceptForChat(quote: Quote, customerId: string): Promise<Quote> {
        this.logger.log(`Customer ${customerId} accepting quote ${quote.id} for chat`);

        await this.revisionService.createRevision(
            quote,
            quote.providerId,
            'Initial quote',
        );

        quote.status = QuoteStatus.ACCEPTED_FOR_CHAT;
        quote.acceptedAt = new Date();
        quote.chatOpenedAt = new Date();

        const savedQuote = await this.quoteRepo.save(quote);

        await this.chatService.createConversationFromQuote(quote.id);

        await this.notificationService.notifyQuoteAcceptedForChat(
            savedQuote,
            customerId,
        );

        return savedQuote;
    }

    
    async reviseQuote(
        quote: Quote,
        newPrice: number,
        newDescription?: string,
        newTerms?: string,
        newEstimatedDuration?: number,
        changeReason?: string,
    ): Promise<Quote> {
        this.logger.log(`Provider revising quote ${quote.id}, new price: ${newPrice}`);

        await this.revisionService.createRevision(
            quote,
            quote.providerId,
            changeReason || 'Price revision',
        );

        quote.price = newPrice;
        if (newDescription) quote.description = newDescription;
        if (newTerms !== undefined) quote.terms = newTerms;
        if (newEstimatedDuration !== undefined) quote.estimatedDuration = newEstimatedDuration;

        quote.status = QuoteStatus.REVISING;
        quote.revisionCount += 1;

        const savedQuote = await this.quoteRepo.save(quote);
        await this.notificationService.notifyQuoteRevised(
            savedQuote,
            quote.post.customerId,

        );

        return savedQuote;
    }

    
    async requestOrder(quote: Quote, customerId: string): Promise<Quote> {
        this.logger.log(`Customer ${customerId} requesting order for quote ${quote.id}`);

        quote.status = QuoteStatus.ORDER_REQUESTED;
        quote.orderRequestedAt = new Date();

        const savedQuote = await this.quoteRepo.save(quote);

        await this.notificationService.notifyOrderRequested(
            savedQuote,
            customerId,
        );

        return savedQuote;
    }

    
    async confirmOrder(quote: Quote): Promise<Quote> {
        this.logger.log(`Provider confirming order for quote ${quote.id}`);

        quote.status = QuoteStatus.CONFIRMED;
        quote.confirmedAt = new Date();

        const savedQuote = await this.quoteRepo.save(quote);

        await this.postRepo.closePost(quote.post);

        await this.rejectOtherQuotes(quote.postId, quote.id);

        return savedQuote;
    }

    
    async rejectQuote(quote: Quote, reason?: string): Promise<Quote> {
        quote.status = QuoteStatus.REJECTED;
        quote.rejectedAt = new Date();
        quote.rejectionReason = reason;

        const savedQuote = await this.quoteRepo.save(quote);

        await this.notificationService.notifyQuoteRejected(savedQuote, reason);

        return savedQuote;
    }

    
    async cancelQuote(quote: Quote, reason?: string): Promise<Quote> {
        quote.status = QuoteStatus.CANCELLED;
        quote.cancelledAt = new Date();
        quote.cancellationReason = reason;

        return await this.quoteRepo.save(quote);
    }

    
    private async rejectOtherQuotes(
        postId: string,
        confirmedQuoteId: string,
    ): Promise<void> {
        const otherQuotes = await this.quoteRepo.find({
            where: {
                postId,
                id: Not(confirmedQuoteId),
                status: Not(QuoteStatus.REJECTED),
                deletedAt: IsNull(),
            },
            relations: ['post'],
        });

        const rejectionReason = 'Khách hàng đã chọn thợ khác';

        for (const quote of otherQuotes) {
            quote.status = QuoteStatus.REJECTED;
            quote.rejectedAt = new Date();
            quote.rejectionReason = rejectionReason;
            await this.quoteRepo.save(quote);

            await this.notificationService.notifyQuoteRejected(
                quote,
                rejectionReason,
            );
        }

        this.logger.log(`Rejected ${otherQuotes.length} other quotes for post ${postId}`);
    }
}