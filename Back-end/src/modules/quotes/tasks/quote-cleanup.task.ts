import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QUOTE_CONSTANTS } from '../constants/quote.constants';
import { Quote } from '../entities/quote.entity';
import { QuoteStatus } from '../enums/quote-status.enum';
import { QuoteRepository } from '../repositories/quote.repository';

@Injectable()
export class QuoteCleanupTask {
    private readonly logger = new Logger(QuoteCleanupTask.name);

    constructor(private readonly quoteRepo: QuoteRepository) { }


    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async autoRejectExpiredQuotes() {
        this.logger.log('Starting auto-reject expired quotes...');

        const expirationDate = new Date();
        expirationDate.setDate(
            expirationDate.getDate() - QUOTE_CONSTANTS.AUTO_REJECT_QUOTE_DAYS,
        );

        const result = await this.quoteRepo
            .createQueryBuilder()
            .update(Quote)
            .set({
                status: QuoteStatus.REJECTED,
                rejectedAt: new Date(),
                rejectionReason: 'Automatic rejection due to response timeout',
            })
            .where('status = :status', { status: QuoteStatus.PENDING })
            .andWhere('created_at < :expirationDate', { expirationDate })
            .execute();

        this.logger.log(
            `Auto-rejected ${result.affected || 0} expired quotes`,
        );
    }


    @Cron(CronExpression.EVERY_WEEK)
    async cleanupDeletedQuotes() {
        this.logger.log('Starting cleanup deleted quotes...');

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);

        const result = await this.quoteRepo
            .createQueryBuilder()
            .delete()
            .where('deleted_at IS NOT NULL')
            .andWhere('deleted_at < :cutoffDate', { cutoffDate })
            .execute();

        this.logger.log(
            `Cleaned up ${result.affected || 0} soft-deleted quotes`,
        );
    }
}