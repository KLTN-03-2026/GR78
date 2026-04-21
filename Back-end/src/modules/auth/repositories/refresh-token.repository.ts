import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, In, MoreThan, Repository, UpdateResult } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { TokenFindOptions } from '../interfaces/token-find-option.interface';

type RefreshTokenWhereCondition = FindOptionsWhere<RefreshToken>;

@Injectable()
export class RefreshTokenRepository {
    private readonly logger = new Logger(RefreshTokenRepository.name);

    constructor(
        @InjectRepository(RefreshToken)
        private readonly repo: Repository<RefreshToken>,
    ) { }


    private getRepository(manager?: EntityManager): Repository<RefreshToken> {
        return manager ? manager.getRepository(RefreshToken) : this.repo;
    }


    async findActiveByUserId(
        userId: string,
        manager?: EntityManager,
    ): Promise<RefreshToken[]> {
        const repository = this.getRepository(manager);

        return await repository.find({
            where: {
                userId,
                isRevoked: false,
                expiresAt: MoreThan(new Date()),
            },
            order: { createdAt: 'DESC' },
        });
    }


    async findActiveByUserAndDevice(
        userId: string,
        deviceId: string,
        manager?: EntityManager,
    ): Promise<RefreshToken | null> {
        const repository = this.getRepository(manager);

        return await repository.findOne({
            where: {
                userId,
                deviceId,
                isRevoked: false,
                expiresAt: MoreThan(new Date()),
            },
            order: { createdAt: 'DESC' },
        });
    }


    async findById(
        id: string,
        options: TokenFindOptions = {},
        manager?: EntityManager,
    ): Promise<RefreshToken | null> {
        const repository = this.getRepository(manager);

        const where: RefreshTokenWhereCondition = { id };

        if (!options.includeRevoked) {
            where.isRevoked = false;
        }

        if (!options.includeExpired) {
            where.expiresAt = MoreThan(new Date());
        }

        const token = await repository.findOne({ where });

        return token ?? null;
    }


    async saveToken(
        userId: string,
        tokenHash: string,
        expiresAt: Date,
        deviceId: string | undefined,
        manager?: EntityManager,
    ): Promise<RefreshToken> {
        const repository = this.getRepository(manager);

        const token = repository.create({
            userId,
            tokenHash,
            expiresAt,
            deviceId: deviceId ?? null,
            isRevoked: false,
            createdAt: new Date(),
        });

        const saved = await repository.save(token);
        this.logger.log(
            `Token created for user ${userId}${deviceId ? ` device ${deviceId}` : ''}`,
        );

        return saved;
    }


    async revokeById(id: string, manager?: EntityManager): Promise<number> {
        const repository = this.getRepository(manager);

        const result: UpdateResult = await repository.update(
            { id, isRevoked: false },
            { isRevoked: true },
        );

        const affected = result.affected ?? 0;

        if (affected > 0) {
            this.logger.log(`Token ${id} revoked`);
        }

        return affected;
    }


    async revokeByIds(ids: string[], manager?: EntityManager): Promise<number> {
        if (!ids || ids.length === 0) {
            return 0;
        }

        const repository = this.getRepository(manager);

        const result: UpdateResult = await repository.update(
            { id: In(ids), isRevoked: false },
            { isRevoked: true },
        );

        const affected = result.affected ?? 0;

        this.logger.log(`Revoked ${affected} tokens`);
        return affected;
    }


    async revokeAllByUserId(userId: string, manager?: EntityManager): Promise<number> {
        const repository = this.getRepository(manager);

        const result: UpdateResult = await repository.update(
            { userId, isRevoked: false },
            { isRevoked: true },
        );

        const affected = result.affected ?? 0;

        this.logger.log(`Revoked all tokens for user ${userId}: ${affected}`);
        return affected;
    }


    async revokeAllByUserAndDevice(
        userId: string,
        deviceId: string,
        manager?: EntityManager,
    ): Promise<number> {
        const repository = this.getRepository(manager);

        const result: UpdateResult = await repository.update(
            { userId, deviceId, isRevoked: false },
            { isRevoked: true },
        );

        const affected = result.affected ?? 0;

        this.logger.log(
            `Revoked tokens for user ${userId} device ${deviceId}: ${affected}`,
        );
        return affected;
    }


    async deleteExpiredAndRevoked(batchSize: number = 1000): Promise<number> {
        const tokensToDelete = await this.repo
            .createQueryBuilder('token')
            .select('token.id')
            .where('token.expiresAt <= :now OR token.isRevoked = true', {
                now: new Date(),
            })
            .limit(batchSize)
            .getMany();

        if (tokensToDelete.length === 0) {
            return 0;
        }

        const ids = tokensToDelete.map((token) => token.id);

        const result = await this.repo
            .createQueryBuilder()
            .delete()
            .where('id IN (:...ids)', { ids })
            .execute();

        const deleted = result.affected ?? 0;

        if (deleted > 0) {
            this.logger.log(`Cleaned up ${deleted} expired/revoked tokens`);
        }

        return deleted;
    }


    async getOldestActiveTokens(
        userId: string,
        limit: number,
        deviceId: string | undefined,
        manager?: EntityManager,
    ): Promise<RefreshToken[]> {
        const repository = this.getRepository(manager);

        const where: RefreshTokenWhereCondition = {
            userId,
            isRevoked: false,
            expiresAt: MoreThan(new Date()),
        };

        if (deviceId) {
            where.deviceId = deviceId;
        }

        return await repository.find({
            where,
            order: { createdAt: 'ASC' },
            take: limit,
        });
    }


    async countActiveTokens(
        userId: string,
        deviceId: string | undefined,
        manager?: EntityManager,
    ): Promise<number> {
        const repository = this.getRepository(manager);

        const where: RefreshTokenWhereCondition = {
            userId,
            isRevoked: false,
            expiresAt: MoreThan(new Date()),
        };

        if (deviceId) {
            where.deviceId = deviceId;
        }

        return await repository.count({ where });
    }
}