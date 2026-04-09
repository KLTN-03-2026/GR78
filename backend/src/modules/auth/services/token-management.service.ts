import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AUTH_CONSTANTS, AUTH_ERROR_CODES } from '../constants/auth.constants';
import { TokenValidationResult } from '../interfaces';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { PasswordUtil } from '../utils/password.util';

@Injectable()
export class TokenManagementService {
    private readonly logger = new Logger(TokenManagementService.name);

    constructor(
        private readonly tokenRepo: RefreshTokenRepository,
    ) { }
    async validateRefreshToken(
        userId: string,
        token: string,
        deviceId?: string,
        manager?: EntityManager,
    ): Promise<TokenValidationResult> {
        const tokens = deviceId
            ? await this.tokenRepo
                .findActiveByUserAndDevice(userId, deviceId, manager)
                .then((t) => (t ? [t] : []))
            : await this.tokenRepo.findActiveByUserId(userId, manager);

        if (tokens.length === 0) {
            return { isValid: false, shouldRevokeAll: true };
        }

        const matchPromises = tokens.map(async (rt) => {
            const match = await PasswordUtil.compareConstantTime(token, rt.tokenHash);
            return match ? rt.id : null;
        });

        const results = await Promise.all(matchPromises);
        const tokenId = results.find((id) => id !== null);

        if (tokenId) {
            return { isValid: true, tokenId };
        }

        return { isValid: false, shouldRevokeAll: true };
    }

    async saveRefreshToken(
        userId: string,
        refreshToken: string,
        refreshTokenExpiry: number,
        deviceId: string | undefined,
        manager?: EntityManager,
    ): Promise<void> {
        const tokenHash = await PasswordUtil.hash(
            refreshToken,
            AUTH_CONSTANTS.REFRESH_TOKEN_BCRYPT_ROUNDS,
        );
        const expiresAt = new Date(
            Date.now() + refreshTokenExpiry * 24 * 60 * 60 * 1000,
        );

        await this.tokenRepo.saveToken(
            userId,
            tokenHash,
            expiresAt,
            deviceId,
            manager,
        );
    }

    async enforceTokenLimit(
        userId: string,
        maxTokens: number,
        deviceId: string | undefined,
        manager?: EntityManager,
    ): Promise<void> {
        const currentCount = await this.tokenRepo.countActiveTokens(
            userId,
            deviceId,
            manager,
        );

        if (currentCount < maxTokens) {
            return;
        }

        const tokensToDelete = currentCount - maxTokens + 1;
        const oldestTokens = await this.tokenRepo.getOldestActiveTokens(
            userId,
            tokensToDelete,
            deviceId,
            manager,
        );

        const idsToRevoke = oldestTokens.map((t) => t.id);
        await this.tokenRepo.revokeByIds(idsToRevoke, manager);

        this.logger.log(
            `Token limit enforced: user ${userId}${deviceId ? `, device ${deviceId}` : ''}: revoked ${idsToRevoke.length} tokens`,
        );
    }


    async revokeById(tokenId: string, manager?: EntityManager): Promise<void> {
        const affected = await this.tokenRepo.revokeById(tokenId, manager);
        if (affected === 0) {
            this.logger.warn(`No active token found with id: ${tokenId}`)
        }
    }

    async revokeAllByUserId(userId: string, manager?: EntityManager): Promise<void> {
        const affected = await this.tokenRepo.revokeAllByUserId(userId, manager);
        if (affected <= 0) {
            this.logger.warn(`No active tokens found for userId=${userId}`);
            throw new UnauthorizedException({
                code: AUTH_ERROR_CODES.REFRESH_TOKEN_NOT_FOUND,
                message: 'No active tokens found',
            });
        }
    }

    async revokeAllByUserAndDevice(userId: string, deviceId: string, manager?: EntityManager): Promise<void> {
        const affected = await this.tokenRepo.revokeAllByUserAndDevice(userId, deviceId, manager);
        if (affected <= 0) {
            this.logger.warn(`No active tokens found for userId=${userId}, deviceId=${deviceId}`);
            throw new UnauthorizedException({
                code: AUTH_ERROR_CODES.REFRESH_TOKEN_NOT_FOUND,
                message: 'No active tokens found for this device',
            });
        }
        this.logger.log(`Revoked ${affected} tokens for userId=${userId}, deviceId=${deviceId}`);
    }
}