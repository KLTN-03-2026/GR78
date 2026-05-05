import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModerationLogRepository } from './repositories/moderation-log.repository';
import { ModerationRequest, ModerationResult } from './interfaces/moderation.interface';
import { AIModerationService } from './services/al-moderation.service';

export interface ModerationContext {
    ipAddress?: string;
    userAgent?: string;
    entityType?: string;
    entityId?: string;
}

@Injectable()
export class ModerationService {
    private readonly logger = new Logger(ModerationService.name);

    constructor(
        private readonly aiModerationService: AIModerationService,
        private readonly moderationLogRepository: ModerationLogRepository,
        private readonly configService: ConfigService,
    ) { }

    async moderatePostContent(
        title: string,
        description: string,
        userId: string,
        context?: ModerationContext,
    ): Promise<ModerationResult> {
        const requestId = this.generateRequestId();

        this.logger.log(`[${requestId}] Moderating post content for user: ${userId}`);

        const userStats = await this.moderationLogRepository.getUserModerationStats(userId);

        if (userStats.recentRejections >= 5) {
            this.logger.warn(`[${requestId}] User ${userId} has ${userStats.recentRejections} recent rejections`);
        }

        const request: ModerationRequest = {
            title,
            description,
            userId,
            requestId,
        };

        const result = await this.aiModerationService.moderateContent(request);

        await this.logModerationResult(
            userId,
            requestId,
            result,
            title,
            description,
            context,
        );

        return result;
    }

    private async logModerationResult(
        userId: string,
        requestId: string,
        result: ModerationResult,
        originalTitle: string,
        originalDescription: string,
        context?: ModerationContext,
    ): Promise<void> {
        try {
            await this.moderationLogRepository.createLog({
                userId,
                entityType: context?.entityType || 'post',
                entityId: context?.entityId,
                requestId,
                result,
                originalTitle,
                originalDescription,
                ipAddress: context?.ipAddress,
                userAgent: context?.userAgent,
            });
        } catch (error) {
            this.logger.error(
                `Failed to log moderation result: ${error instanceof Error ? error.message : 'Unknown'}`,
                error instanceof Error ? error.stack : undefined,
            );
        }
    }

    async getUserModerationHistory(userId: string, limit = 20) {
        return this.moderationLogRepository.findByUser(userId, limit);
    }

    async getUserModerationStats(userId: string) {
        return this.moderationLogRepository.getUserModerationStats(userId);
    }

    private generateRequestId(): string {
        return `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}