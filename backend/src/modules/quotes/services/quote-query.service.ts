import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { Quote } from '../entities/quote.entity';
import { QuoteStatus } from '../enums/quote-status.enum';
import { QuoteRepository } from '../repositories/quote.repository';

@Injectable()
export class QuoteQueryService {
    constructor(private readonly quoteRepo: QuoteRepository) { }

    
    async findQuoteById(quoteId: string): Promise<Quote> {
        const quote = await this.quoteRepo.findOne({
            where: { id: quoteId },
        });

        if (!quote) {
            throw new NotFoundException('Not found quote');
        }

        return quote;
    }

    
    async findQuoteWithRelations(
        quoteId: string,
        relations: string[],
    ): Promise<Quote> {
        const quote = await this.quoteRepo.findOne({
            where: { id: quoteId },
            relations,
        });

        if (!quote) {
            throw new NotFoundException('Not found quote');
        }

        return quote;
    }

   
    async findProviderQuotes(
        providerId: string,
        status?: QuoteStatus,
    ): Promise<Quote[]> {
        const where: any = { providerId, deletedAt: IsNull() };
        if (status) where.status = status;

        return await this.quoteRepo.find({
            where,
            relations: ['post', 'post.customer'],
            order: { createdAt: 'DESC' },
        });
    }

   
    async findPostQuotes(postId: string): Promise<Quote[]> {
        return await this.quoteRepo.find({
            where: { postId, deletedAt: IsNull() },
            relations: ['provider'],
            order: { createdAt: 'DESC' },
        });
    }
}