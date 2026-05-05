import { InternalServerException } from '@/common/exceptions';
import { ErrorUtil } from '@/common/utils/error.util';
import { UserRepository } from '@/modules/users/repositories/user.repository';
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { AUTH_CONSTANTS, OTP_CONSTANTS } from '../constants/auth.constants';
import { EmailOtpRepository } from '../repositories/email-otp.repository';
import { OtpPurpose } from '../enums/otp-purpose.enum';
import {
    InvalidOtpException,
    OtpCooldownException,
    OtpMaxAttemptsException,
} from '../exceptions/otp.exception';
import { SamePasswordException } from '../exceptions/password-reset.exception';
import { EmailOtp } from '../entities/email-otp.entity';
import { ResendMailService } from './resend-mail.service';
import { TokenManagementService } from './token-management.service';
import { PasswordUtil } from '../utils/password.util';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);

    constructor(
        private readonly otpRepo: EmailOtpRepository,
        private readonly userRepo: UserRepository,
        private readonly mailService: ResendMailService,
        private readonly tokenMgmt: TokenManagementService,
    ) {}

    /**
     * Called right after user registration — fire-and-forget.
     * Errors are swallowed so they never fail the registration response.
     */
    async sendVerificationOtp(
        userId: string,
        email: string,
        ipAddress: string | null,
    ): Promise<void> {
        try {
            const latest = await this.otpRepo.findLatestActiveByUserId(
                userId,
                OtpPurpose.EMAIL_VERIFICATION,
            );
            if (latest && this.isWithinCooldown(latest.createdAt)) {
                return; // silently skip — auto-send after register, cooldown not an error
            }

            await this.otpRepo.invalidateAllActiveForUser(userId, OtpPurpose.EMAIL_VERIFICATION);
            const { rawOtp, otpHash } = this.generateOtp();
            const expiresAt = new Date(Date.now() + OTP_CONSTANTS.EXPIRE_MINUTES * 60 * 1000);

            await this.otpRepo.create({
                userId,
                email,
                purpose: OtpPurpose.EMAIL_VERIFICATION,
                otpHash,
                expiresAt,
                ipAddress,
            });

            void this.mailService.sendVerificationOtpEmail({
                toEmail: email,
                otp: rawOtp,
                expiresInMinutes: OTP_CONSTANTS.EXPIRE_MINUTES,
            });

            this.logger.log(`Verification OTP sent to userId=${userId}`);
        } catch (err) {
            this.logger.error(
                `sendVerificationOtp failed for userId=${userId}: ${ErrorUtil.getMessage(err)}`,
            );
        }
    }

    /**
     * POST /auth/resend-verification
     * Explicitly requested resend — throws on cooldown to give user feedback.
     */
    async resendVerificationOtp(email: string, ipAddress: string | null): Promise<void> {
        const user = await this.userRepo.findByEmail(email.toLowerCase().trim());
        if (!user) {
            return; // anti-enumeration
        }

        if (user.isVerified) {
            return; // already verified — no error, idempotent
        }

        const latest = await this.otpRepo.findLatestActiveByUserId(
            user.id,
            OtpPurpose.EMAIL_VERIFICATION,
        );
        if (latest && this.isWithinCooldown(latest.createdAt)) {
            throw new OtpCooldownException(OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS);
        }

        await this.otpRepo.invalidateAllActiveForUser(user.id, OtpPurpose.EMAIL_VERIFICATION);
        const { rawOtp, otpHash } = this.generateOtp();
        const expiresAt = new Date(Date.now() + OTP_CONSTANTS.EXPIRE_MINUTES * 60 * 1000);

        await this.otpRepo.create({
            userId: user.id,
            email: user.email!,
            purpose: OtpPurpose.EMAIL_VERIFICATION,
            otpHash,
            expiresAt,
            ipAddress,
        });

        void this.mailService.sendVerificationOtpEmail({
            toEmail: user.email!,
            otp: rawOtp,
            expiresInMinutes: OTP_CONSTANTS.EXPIRE_MINUTES,
        });

        this.logger.log(`Verification OTP resent to userId=${user.id}`);
    }

    /**
     * POST /auth/verify-email
     * Verifies OTP and marks user as verified.
     */
    async verifyEmail(email: string, otp: string): Promise<void> {
        const user = await this.userRepo.findByEmail(email.toLowerCase().trim());
        if (!user) {
            throw new InvalidOtpException(); // anti-enumeration
        }

        if (user.isVerified) {
            return; // idempotent
        }

        const record = await this.otpRepo.findLatestActiveByUserId(
            user.id,
            OtpPurpose.EMAIL_VERIFICATION,
        );

        await this.validateOtpCode(record, otp);

        await Promise.all([
            this.otpRepo.markAsUsed(record!.id),
            this.userRepo.updateUser(user.id, { isVerified: true }),
        ]);

        this.logger.log(`Email verified for userId=${user.id}`);
    }

    /**
     * POST /auth/forgot-password-otp
     * Always returns void (no throw) to prevent user enumeration.
     * Rate limiting is enforced at the controller level via @Throttle.
     */
    async sendPasswordResetOtp(email: string, ipAddress: string | null): Promise<void> {
        try {
            const user = await this.userRepo.findByEmail(email.toLowerCase().trim());
            if (!user) {
                return; // anti-enumeration
            }

            const latest = await this.otpRepo.findLatestActiveByUserId(
                user.id,
                OtpPurpose.PASSWORD_RESET,
            );
            if (latest && this.isWithinCooldown(latest.createdAt)) {
                this.logger.warn(
                    `Password reset OTP cooldown for userId=${user.id} from IP=${ipAddress}`,
                );
                return; // silently skip — no enumeration via cooldown error
            }

            await this.otpRepo.invalidateAllActiveForUser(user.id, OtpPurpose.PASSWORD_RESET);
            const { rawOtp, otpHash } = this.generateOtp();
            const expiresAt = new Date(Date.now() + OTP_CONSTANTS.EXPIRE_MINUTES * 60 * 1000);

            await this.otpRepo.create({
                userId: user.id,
                email: user.email!,
                purpose: OtpPurpose.PASSWORD_RESET,
                otpHash,
                expiresAt,
                ipAddress,
            });

            void this.mailService.sendPasswordResetOtpEmail({
                toEmail: user.email!,
                otp: rawOtp,
                expiresInMinutes: OTP_CONSTANTS.EXPIRE_MINUTES,
            });

            this.logger.log(`Password reset OTP sent to userId=${user.id} from IP=${ipAddress}`);
        } catch (err) {
            this.logger.error(
                `sendPasswordResetOtp failed for ${email}: ${ErrorUtil.getMessage(err)}`,
            );
            throw new InternalServerException('Failed to process forgot password request');
        }
    }

    /**
     * POST /auth/reset-password-otp
     * Verifies OTP, updates password, revokes all sessions, sends confirmation email.
     */
    async resetPasswordByOtp(
        email: string,
        otp: string,
        newPassword: string,
        ipAddress: string | null,
    ): Promise<void> {
        try {
            const user = await this.userRepo.findByEmail(email.toLowerCase().trim());
            if (!user) {
                throw new InvalidOtpException(); // anti-enumeration
            }

            const record = await this.otpRepo.findLatestActiveByUserId(
                user.id,
                OtpPurpose.PASSWORD_RESET,
            );

            await this.validateOtpCode(record, otp);

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

            await this.userRepo.updateUser(user.id, { passwordHash: newPasswordHash });
            await this.otpRepo.markAsUsed(record!.id);

            await this.tokenMgmt.revokeAllByUserId(user.id).catch((err) => {
                this.logger.warn(
                    `revokeAllByUserId for ${user.id}: ${ErrorUtil.getMessage(err)}`,
                );
            });

            this.logger.log(
                `Password reset via OTP for userId=${user.id} from IP=${ipAddress}`,
            );

            if (user.email) {
                void this.mailService.sendPasswordChangedEmail({
                    toEmail: user.email,
                    ipAddress,
                    changedAt: new Date(),
                });
            }
        } catch (err) {
            if (
                ErrorUtil.isKnownException(
                    err,
                    InvalidOtpException,
                    OtpMaxAttemptsException,
                    SamePasswordException,
                )
            ) {
                throw err;
            }

            const errorMessage = ErrorUtil.getMessage(err);
            const errorStack = ErrorUtil.getStack(err);
            this.logger.error(`resetPasswordByOtp failed for ${email}: ${errorMessage}`, errorStack);
            throw new InternalServerException('Failed to reset password');
        }
    }

    // ─── PRIVATE HELPERS ────────────────────────────────────────────────────────

    private generateOtp(): { rawOtp: string; otpHash: string } {
        const rawOtp = String(crypto.randomInt(100000, 1000000));
        const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
        return { rawOtp, otpHash };
    }

    private hashOtp(otp: string): string {
        return crypto.createHash('sha256').update(otp.trim()).digest('hex');
    }

    private isWithinCooldown(createdAt: Date): boolean {
        return Date.now() - createdAt.getTime() < OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS * 1000;
    }

    private async validateOtpCode(record: EmailOtp | null, rawOtp: string): Promise<void> {
        if (!record || !record.isValid()) {
            throw new InvalidOtpException();
        }

        const hash = this.hashOtp(rawOtp);
        if (hash !== record.otpHash) {
            const attempts = await this.otpRepo.incrementAttempts(record.id);
            if (attempts >= OTP_CONSTANTS.MAX_ATTEMPTS) {
                await this.otpRepo.markAsUsed(record.id); // permanently invalidate
                throw new OtpMaxAttemptsException();
            }
            throw new InvalidOtpException();
        }
    }
}
