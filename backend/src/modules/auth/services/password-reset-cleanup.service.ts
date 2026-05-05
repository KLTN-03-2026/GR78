import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';
import { EmailOtpRepository } from '../repositories/email-otp.repository';


@Injectable()
export class PasswordResetCleanupService {
    private readonly logger = new Logger(PasswordResetCleanupService.name);

    constructor(
        private readonly resetTokenRepo: PasswordResetTokenRepository,
        private readonly otpRepo: EmailOtpRepository,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async cleanupExpiredTokens(): Promise<void> {
        this.logger.log('Running auth cleanup...');
        try {
            const [deletedTokens, deletedOtps] = await Promise.all([
                this.resetTokenRepo.deleteExpired(),
                this.otpRepo.deleteExpired(),
            ]);
            this.logger.log(
                `Cleanup complete: ${deletedTokens} reset tokens, ${deletedOtps} OTP records removed`,
            );
        } catch (err) {
            this.logger.error('Auth cleanup failed', err);
        }
    }
}