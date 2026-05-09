import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModerationLog } from '../entities/moderation-log.entity';
import { ModerationResult } from '../interfaces/moderation.interface';

export interface CreateModerationLogDto {
    userId: string;
    entityType: string;
    entityId?: string;
    requestId: string;
    result: ModerationResult;
    originalTitle: string;
    originalDescription: string;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class ModerationLogRepository {
    private readonly logger = new Logger(ModerationLogRepository.name);

    constructor(
        @InjectRepository(ModerationLog)
        private readonly repository: Repository<ModerationLog>,
    ) { }

    async createLog(dto: CreateModerationLogDto): Promise<ModerationLog> {
        const log = this.repository.create({
            userId: dto.userId,
            entityType: dto.entityType,
            entityId: dto.entityId,
            requestId: dto.requestId,
            status: dto.result.status,
            isAllowed: dto.result.isAllowed,
            confidence: dto.result.confidence,
            violationTypes: dto.result.violations.map(v => v.type),
            violationsDetail: dto.result.violations,
            originalTitle: dto.originalTitle,
            originalDescription: dto.originalDescription,
            moderatedContent: dto.result.moderatedContent,
            metadata: {
                ...dto.result.metadata,
                ipAddress: dto.ipAddress,
                userAgent: dto.userAgent,
            },
        });

        const saved = await this.repository.save(log);
        this.logger.log(`Moderation log created: ${saved.id}`);

        return saved;
    }

    async findByUser(userId: string, limit = 50): Promise<ModerationLog[]> {
        return this.repository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async findByEntity(
        entityType: string,
        entityId: string
    ): Promise<ModerationLog | null> {
        return this.repository.findOne({
            where: { entityType, entityId },
            order: { createdAt: 'DESC' },
        });
    }

    async countUserRejections(
        userId: string,
        withinHours = 24
    ): Promise<number> {
        const since = new Date();
        since.setHours(since.getHours() - withinHours);

        return this.repository.count({
            where: {
                userId,
                isAllowed: false,
            },
        });
    }

    async getUserModerationStats(userId: string): Promise<{
        total: number;
        approved: number;
        rejected: number;
        recentRejections: number;
    }> {
        const [total, rejected, recentRejections] = await Promise.all([
            this.repository.count({ where: { userId } }),
            this.repository.count({ where: { userId, isAllowed: false } }),
            this.countUserRejections(userId, 24),
        ]);

        return {
            total,
            approved: total - rejected,
            rejected,
            recentRejections,
        };
    }
}