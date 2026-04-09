import { PostRepository } from '@/modules/posts/repositories/post.repository';
import { UserRepository } from '@/modules/users/repositorys/user.repository';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
    CreateQuoteDto,
    ReviseQuoteDto,
    UpdateQuoteDto
} from './dtos/quote.dto';
import { Quote } from './entities/quote.entity';
import { QuoteRepository } from './repositories/quote.repository';
import { QuoteNotificationService } from './services/quote-notification.service';
import { QuoteQueryService } from './services/quote-query.service';
import { QuoteRevisionService } from './services/quote-revision.service';
import { QuoteStatusService } from './services/quote-status.service';
import { QuoteValidationService } from './services/quote-validation.service';

@Injectable()
export class QuoteService {
    private readonly logger = new Logger(QuoteService.name);

    constructor(
        private readonly postRepository: PostRepository,
        private readonly userRepository: UserRepository,
        private readonly quoteRepo: QuoteRepository,
        private readonly validationService: QuoteValidationService,
        private readonly statusService: QuoteStatusService,
        private readonly queryService: QuoteQueryService,
        private readonly revisionService: QuoteRevisionService,
        private readonly notificationService: QuoteNotificationService,
    ) { }

    
    async createQuote(providerId: string, dto: CreateQuoteDto): Promise<Quote> {
        const provider = await this.validationService.validateProvider(providerId);
        const post = await this.validationService.validatePostForQuote(dto.postId, providerId);

        this.validationService.validatePrice(dto.price, post.budget);

        const quote = this.quoteRepo.create({
            postId: dto.postId,
            providerId,
            price: dto.price,
            description: dto.description,
            terms: dto.terms,
            estimatedDuration: dto.estimatedDuration,
            imageUrls: dto.imageUrls || [],
        });

        const savedQuote = await this.quoteRepo.save(quote);

        await this.notificationService.notifyNewQuote(
            post.customerId,
            savedQuote,
            provider,
            post,
        );

        this.logger.log(`Quote created: ${savedQuote.id} for post ${post.id}`);
        return savedQuote;
    }

    
    async acceptQuoteForChat(quoteId: string, customerId: string): Promise<Quote> {
        const quote = await this.queryService.findQuoteWithRelations(quoteId, [
            'post',
            'provider',
        ]);

        this.validationService.validatePostOwnership(quote.post, customerId);
        this.validationService.validateQuoteIsPending(quote);
        this.validationService.validatePostIsOpen(quote.post);

        return await this.statusService.acceptForChat(quote, customerId);
    }

    
    async reviseQuote(
        quoteId: string,
        providerId: string,
        dto: ReviseQuoteDto,
    ): Promise<Quote> {
        const quote = await this.queryService.findQuoteWithRelations(quoteId, ['post']);

        this.validationService.validateQuoteOwnership(quote, providerId);

        if (!quote.canRevise()) {
            throw new BadRequestException('Quote cannot be revised at this stage');
        }

        this.validationService.validatePrice(dto.price, quote.post.budget);

        return await this.statusService.reviseQuote(
            quote,
            dto.price,
            dto.description,
            dto.terms,
            dto.estimatedDuration,
            dto.changeReason,
        );
    }

    
    async requestOrder(quoteId: string, customerId: string): Promise<Quote> {
        const quote = await this.queryService.findQuoteWithRelations(quoteId, ['post']);

        this.validationService.validatePostOwnership(quote.post, customerId);

        if (!quote.canRequestOrder()) {
            throw new BadRequestException('Cannot request order for this quote');
        }

        return await this.statusService.requestOrder(quote, customerId);
    }

    
    async updateQuote(
        quoteId: string,
        providerId: string,
        dto: UpdateQuoteDto,
    ): Promise<Quote> {
        const quote = await this.queryService.findQuoteWithRelations(quoteId, [
            'post',
            'provider',
        ]);

        this.validationService.validateQuoteOwnership(quote, providerId);
        this.validationService.validateQuoteCanEdit(quote);

        if (dto.price !== undefined) {
            this.validationService.validatePrice(dto.price);
            quote.price = dto.price;
        }

        this.updateQuoteFields(quote, dto);

        return await this.quoteRepo.save(quote);
    }

    
    async cancelQuote(
        quoteId: string,
        providerId: string,
        reason?: string,
    ): Promise<Quote> {
        const quote = await this.queryService.findQuoteWithRelations(quoteId, ['post']);

        this.validationService.validateQuoteOwnership(quote, providerId);
        this.validationService.validateQuoteCanCancel(quote);

        return await this.statusService.cancelQuote(quote, reason);
    }

    
    async rejectQuote(
        quoteId: string,
        customerId: string,
        reason?: string,
    ): Promise<Quote> {
        const quote = await this.queryService.findQuoteWithRelations(quoteId, ['post']);

        this.validationService.validatePostOwnership(quote.post, customerId);
        this.validationService.validateQuoteIsPending(quote);

        return await this.statusService.rejectQuote(quote, reason);
    }

    
    async getProviderQuotes(
        providerId: string,
        status?: string,
    ): Promise<Quote[]> {
        return await this.queryService.findProviderQuotes(providerId, status as any);
    }

    
    async getPostQuotes(postId: string, customerId: string): Promise<Quote[]> {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        this.validationService.validatePostOwnership(post, customerId);

        return await this.queryService.findPostQuotes(postId);
    }

    
    async getQuoteById(quoteId: string, userId: string): Promise<Quote> {
        const quote = await this.queryService.findQuoteWithRelations(quoteId, [
            'post',
            'post.customer',
            'provider',
        ]);

        this.validationService.validateQuoteAccess(quote, userId);

        return quote;
    }

    
    async getQuoteRevisionHistory(quoteId: string, userId: string) {
        const quote = await this.queryService.findQuoteWithRelations(quoteId, ['post']);
        this.validationService.validateQuoteAccess(quote, userId);

        const revisions = await this.revisionService.getRevisionHistory(quoteId);
        const priceChanges = await this.revisionService.getPriceChanges(quoteId);

        return {
            quote,
            revisions,
            priceChanges,
        };
    }

    
    async deleteQuote(quoteId: string, providerId: string): Promise<void> {
        const quote = await this.queryService.findQuoteById(quoteId);

        this.validationService.validateQuoteOwnership(quote, providerId);
        this.validationService.validateQuoteCanCancel(quote);

        await this.quoteRepo.softDelete(quoteId);
    }

    private updateQuoteFields(quote: Quote, dto: UpdateQuoteDto): void {
        if (dto.description !== undefined) {
            quote.description = dto.description;
        }
        if (dto.terms !== undefined) {
            quote.terms = dto.terms;
        }
        if (dto.estimatedDuration !== undefined) {
            quote.estimatedDuration = dto.estimatedDuration;
        }
        if (dto.imageUrls !== undefined) {
            quote.imageUrls = dto.imageUrls;
        }
    }
}