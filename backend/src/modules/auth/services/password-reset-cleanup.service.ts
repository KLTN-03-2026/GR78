import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';


@Injectable()
export class PasswordResetCleanupService {
    private readonly logger = new Logger(PasswordResetCleanupService.name);

    constructor(
        private readonly resetTokenRepo: PasswordResetTokenRepository,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async cleanupExpiredTokens(): Promise<void> {
        this.logger.log('Running password reset token cleanup...');
        try {
            const deleted = await this.resetTokenRepo.deleteExpired();
            this.logger.log(`Cleanup complete: ${deleted} expired tokens removed`);
        } catch (err) {
            this.logger.error('Password reset token cleanup failed', err);
        }
    }
}