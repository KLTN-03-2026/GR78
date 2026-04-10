import { Transactional, TransactionManager } from '@/common/decorators/@Transaction';
import { InternalServerException } from '@/common/exceptions';
import { ErrorUtil } from '@/common/utils/error.util';
import { UserRepository } from '@/modules/users/repositorys/user.repository';
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { EntityManager } from 'typeorm';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';
import { TokenManagementService } from './token-management.service';
import { ResendMailService } from './resend-mail.service';
import { PasswordUtil } from '../utils/password.util';
import {
    InvalidResetTokenException,
    SamePasswordException,
} from '../exceptions/password-reset.exception';

@Injectable()
export class PasswordResetService {
    private readonly logger = new Logger(PasswordResetService.name);

    private readonly RESET_TOKEN_EXPIRE_MINUTES = 15;

    constructor(
        private readonly userRepo: UserRepository,
        private readonly resetTokenRepo: PasswordResetTokenRepository,
        private readonly tokenMgmt: TokenManagementService,
        private readonly mailService: ResendMailService,
    ) {}

    
    @Transactional()
    async forgotPassword(
        email: string,
        ipAddress: string | null,
        @TransactionManager() manager?: EntityManager,
    ): Promise<void> {
        try {
            const user = await this.userRepo.findByEmail(email, manager);

            if (!user) {
                this.logger.warn(`Forgot password requested for unknown email: ${email} from IP: ${ipAddress}`);
                return;
            }

            await this.resetTokenRepo.deleteOldTokensByUserId(user.id, manager);

            const rawToken = crypto.randomBytes(32).toString('hex');

            const tokenHash = crypto
                .createHash('sha256')
                .update(rawToken)
                .digest('hex');

            const expiresAt = new Date(
                Date.now() + this.RESET_TOKEN_EXPIRE_MINUTES * 60 * 1000,
            );

            await this.resetTokenRepo.create(
                {
                    userId: user.id,
                    tokenHash,
                    expiresAt,
                    ipAddress,
                },
                manager,
            );

            this.logger.log(`Password reset token created for userId=${user.id}`);

            const resetUrl = this.buildResetUrl(rawToken);
            void this.mailService.sendResetPasswordEmail({
                toEmail: email,
                resetUrl,
                expiresInMinutes: this.RESET_TOKEN_EXPIRE_MINUTES,
            });
        } catch (error: unknown) {
            const errorMessage = ErrorUtil.getMessage(error);
            const errorStack = ErrorUtil.getStack(error);
            this.logger.error(`forgotPassword failed for ${email}: ${errorMessage}`, errorStack);
            throw new InternalServerException('Failed to process forgot password request');
        }
    }

    
    @Transactional()
    async resetPassword(
        rawToken: string,
        newPassword: string,
        ipAddress: string | null,
        @TransactionManager() manager?: EntityManager,
    ): Promise<void> {
        try {
            const tokenHash = crypto
                .createHash('sha256')
                .update(rawToken)
                .digest('hex');

            const resetToken = await this.resetTokenRepo.findValidByHash(tokenHash, manager);

            if (!resetToken || !resetToken.isValid()) {
                this.logger.warn(
                    `Invalid/expired reset token attempt from IP: ${ipAddress}`,
                );
                throw new InvalidResetTokenException();
            }

            const user = resetToken.user;

            const isSamePassword = await PasswordUtil.compareConstantTime(
                newPassword,
                user.passwordHash ?? null,
            );
            if (isSamePassword) {
                throw new SamePasswordException();
            }

            const newPasswordHash = await PasswordUtil.hash(
                newPassword,
                AUTH_CONSTANTS.BCRYPT_ROUNDS,
            );

            await this.userRepo.updateUser(
                user.id,
                { passwordHash: newPasswordHash },
                manager,
            );

            await this.resetTokenRepo.markAsUsed(resetToken.id, manager);

            await this.tokenMgmt.revokeAllByUserId(user.id, manager).catch((err) => {
                this.logger.warn(`revokeAllByUserId for ${user.id}: ${ErrorUtil.getMessage(err)}`);
            });

            this.logger.log(
                `Password reset successful for userId=${user.id} from IP=${ipAddress}`,
            );

            if (user.email) {
                void this.mailService.sendPasswordChangedEmail({
                    toEmail: user.email,
                    ipAddress,
                    changedAt: new Date(),
                });
            }
        } catch (error: unknown) {
            if (
                ErrorUtil.isKnownException(
                    error,
                    InvalidResetTokenException,
                    SamePasswordException,
                )
            ) {
                throw error;
            }

            const errorMessage = ErrorUtil.getMessage(error);
            const errorStack = ErrorUtil.getStack(error);
            this.logger.error(`resetPassword failed: ${errorMessage}`, errorStack);
            throw new InternalServerException('Failed to reset password');
        }
    }


    private buildResetUrl(rawToken: string): string {
        const baseUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:3000';
        return `${baseUrl}/reset-password?token=${rawToken}`;
    }
}