import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteRevision } from '../entities/quote-revision.entity';
import { Quote } from '../entities/quote.entity';

@Injectable()
export class QuoteRevisionService {
    constructor(
        @InjectRepository(QuoteRevision)
        private readonly revisionRepo: Repository<QuoteRevision>,
    ) { }

    
    async createRevision(
        quote: Quote,
        changedBy: string,
        changeReason?: string,
    ): Promise<QuoteRevision> {
        const revision = this.revisionRepo.create({
            quoteId: quote.id,
            price: quote.price,
            description: quote.description,
            terms: quote.terms,
            estimatedDuration: quote.estimatedDuration,
            imageUrls: quote.imageUrls,
            revisionNumber: quote.revisionCount,
            changedBy,
            changeReason,
        });

        return await this.revisionRepo.save(revision);
    }

    
    async getRevisionHistory(quoteId: string): Promise<QuoteRevision[]> {
        return await this.revisionRepo.find({
            where: { quoteId },
            order: { revisionNumber: 'ASC' },
        });
    }

    
    async getLatestRevision(quoteId: string): Promise<QuoteRevision> {
        const revision = await this.revisionRepo.findOne({
            where: { quoteId },
            order: { revisionNumber: 'DESC' },
        });

        if (!revision) {
            throw new NotFoundException(`No revision found for quote ${quoteId}`);
        }

        return revision;
    }

    
    async markRevisionAsUsedForOrder(
        revisionId: string,
        orderId: string,
    ): Promise<QuoteRevision> {
        const revision = await this.revisionRepo.findOne({
            where: { id: revisionId },
        });

        if (!revision) {
            throw new NotFoundException(`Revision ${revisionId} not found`);
        }

        revision.usedForOrderId = orderId;
        revision.usedAt = new Date();

        return await this.revisionRepo.save(revision);
    }

    
    async isRevisionUsedForOrder(revisionId: string): Promise<boolean> {
        const revision = await this.revisionRepo.findOne({
            where: { id: revisionId },
            select: ['id', 'usedForOrderId'],
        });

        return !!revision?.usedForOrderId;
    }

    
    async getPriceChanges(quoteId: string): Promise<{
        revisionNumber: number;
        price: number;
        priceChange?: number;
        percentChange?: number;
        timestamp: Date;
    }[]> {
        const revisions = await this.getRevisionHistory(quoteId);

        return revisions.map((revision, index) => {
            const result: any = {
                revisionNumber: revision.revisionNumber,
                price: parseFloat(revision.price.toString()),
                timestamp: revision.createdAt,
            };

            if (index > 0) {
                const previousPrice = parseFloat(revisions[index - 1].price.toString());
                const currentPrice = parseFloat(revision.price.toString());
                result.priceChange = currentPrice - previousPrice;
                result.percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
            }

            return result;
        });
    }
}