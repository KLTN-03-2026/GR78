import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, Repository } from 'typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

@Injectable()
export class PasswordResetTokenRepository {
    private readonly logger = new Logger(PasswordResetTokenRepository.name);

    constructor(
        @InjectRepository(PasswordResetToken)
        private readonly repo: Repository<PasswordResetToken>,
    ) {}

    private getRepo(manager?: EntityManager): Repository<PasswordResetToken> {
        return manager ? manager.getRepository(PasswordResetToken) : this.repo;
    }

    
    async create(
        data: {
            userId: string;
            tokenHash: string;
            expiresAt: Date;
            ipAddress: string | null;
        },
        manager?: EntityManager,
    ): Promise<PasswordResetToken> {
        const repo = this.getRepo(manager);
        const entity = repo.create({
            userId: data.userId,
            tokenHash: data.tokenHash,
            expiresAt: data.expiresAt,
            ipAddress: data.ipAddress,
            usedAt: null,
        });
        const saved = await repo.save(entity);
        this.logger.log(`Password reset token created for userId=${data.userId}`);
        return saved;
    }

   
    async findValidByHash(
        tokenHash: string,
        manager?: EntityManager,
    ): Promise<PasswordResetToken | null> {
        return this.getRepo(manager).findOne({
            where: {
                tokenHash,
                usedAt: undefined,  
            },
            relations: ['user'],
        });
    }

    
    async markAsUsed(
        tokenId: string,
        manager?: EntityManager,
    ): Promise<void> {
        await this.getRepo(manager).update(tokenId, {
            usedAt: new Date(),
        });
        this.logger.log(`Password reset token marked as used: id=${tokenId}`);
    }

    
    async deleteOldTokensByUserId(
        userId: string,
        manager?: EntityManager,
    ): Promise<void> {
        await this.getRepo(manager)
            .createQueryBuilder()
            .delete()
            .from(PasswordResetToken)
            .where('user_id = :userId', { userId })
            .execute();
        this.logger.log(`Old password reset tokens deleted for userId=${userId}`);
    }

   
    async deleteExpired(): Promise<number> {
        const result = await this.repo.delete({
            expiresAt: LessThan(new Date()),
        });
        const affected = result.affected ?? 0;
        if (affected > 0) {
            this.logger.log(`Cleanup: deleted ${affected} expired password reset tokens`);
        }
        return affected;
    }
}