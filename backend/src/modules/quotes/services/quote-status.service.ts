import { ChatService } from '@/modules/chat/chat.service';
import { Injectable, Logger } from '@nestjs/common';
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

        const customerId = quote.post?.customerId ?? quote.customRequest?.customerId;
        if (customerId) {
            await this.notificationService.notifyQuoteRevised(savedQuote, customerId);
        }

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

}