import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, LessThan, Repository } from 'typeorm';
import { EmailOtp } from '../entities/email-otp.entity';
import { OtpPurpose } from '../enums/otp-purpose.enum';

@Injectable()
export class EmailOtpRepository {
    private readonly logger = new Logger(EmailOtpRepository.name);

    constructor(
        @InjectRepository(EmailOtp)
        private readonly repo: Repository<EmailOtp>,
    ) {}

    private getRepo(manager?: EntityManager): Repository<EmailOtp> {
        return manager ? manager.getRepository(EmailOtp) : this.repo;
    }

    async create(
        data: {
            userId: string;
            email: string;
            purpose: OtpPurpose;
            otpHash: string;
            expiresAt: Date;
            ipAddress: string | null;
        },
        manager?: EntityManager,
    ): Promise<EmailOtp> {
        const repo = this.getRepo(manager);
        const entity = repo.create({ ...data, usedAt: null, attempts: 0 });
        const saved = await repo.save(entity);
        this.logger.log(`OTP created for userId=${data.userId} purpose=${data.purpose}`);
        return saved;
    }

    async findLatestActiveByUserId(
        userId: string,
        purpose: OtpPurpose,
        manager?: EntityManager,
    ): Promise<EmailOtp | null> {
        return this.getRepo(manager).findOne({
            where: { userId, purpose, usedAt: IsNull() },
            order: { createdAt: 'DESC' },
        });
    }

    async incrementAttempts(id: string, manager?: EntityManager): Promise<number> {
        await this.getRepo(manager).increment({ id }, 'attempts', 1);
        const updated = await this.getRepo(manager).findOne({
            where: { id },
            select: ['attempts'],
        });
        return updated?.attempts ?? 0;
    }

    async markAsUsed(id: string, manager?: EntityManager): Promise<void> {
        await this.getRepo(manager).update(id, { usedAt: new Date() });
        this.logger.log(`OTP marked as used: id=${id}`);
    }

    async invalidateAllActiveForUser(
        userId: string,
        purpose: OtpPurpose,
        manager?: EntityManager,
    ): Promise<void> {
        await this.getRepo(manager)
            .createQueryBuilder()
            .delete()
            .from(EmailOtp)
            .where('user_id = :userId', { userId })
            .andWhere('purpose = :purpose', { purpose })
            .andWhere('used_at IS NULL')
            .execute();
    }

    async deleteExpired(): Promise<number> {
        const result = await this.repo.delete({
            expiresAt: LessThan(new Date()),
        });
        const affected = result.affected ?? 0;
        if (affected > 0) {
            this.logger.log(`Cleanup: deleted ${affected} expired OTP records`);
        }
        return affected;
    }
}
