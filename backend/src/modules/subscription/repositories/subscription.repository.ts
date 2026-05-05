import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, LessThanOrEqual, Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

@Injectable()
export class SubscriptionRepository {
    private readonly logger = new Logger(SubscriptionRepository.name);

    constructor(
        @InjectRepository(Subscription)
        private readonly repo: Repository<Subscription>,
    ) {}

    private getRepo(manager?: EntityManager): Repository<Subscription> {
        return manager ? manager.getRepository(Subscription) : this.repo;
    }

    async findByUserId(userId: string, manager?: EntityManager): Promise<Subscription | null> {
        try {
            return await this.getRepo(manager).findOne({
                where: { userId },
                relations: ['plan', 'discount'],
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            this.logger.error(`Error finding subscription for user: ${userId}`, error);
            throw error;
        }
    }

    async findById(id: string, manager?: EntityManager): Promise<Subscription | null> {
        try {
            return await this.getRepo(manager).findOne({
                where: { id },
                relations: ['plan', 'discount'],
            });
        } catch (error) {
            this.logger.error(`Error finding subscription: ${id}`, error);
            throw error;
        }
    }

    async findByUserIdWithLock(userId: string, manager: EntityManager): Promise<Subscription | null> {
        try {
            return await manager.getRepository(Subscription).findOne({
                where: { userId },
                lock: { mode: 'pessimistic_write' },
                relations: ['plan', 'discount'],
            });
        } catch (error) {
            this.logger.error(`Error finding subscription with lock for user: ${userId}`, error);
            throw error;
        }
    }

    async findAll(
        status?: SubscriptionStatus,
        page = 1,
        limit = 20,
        manager?: EntityManager,
    ): Promise<[Subscription[], number]> {
        try {
            const qb = this.getRepo(manager)
                .createQueryBuilder('sub')
                .leftJoinAndSelect('sub.plan', 'plan')
                .leftJoinAndSelect('sub.discount', 'discount')
                .orderBy('sub.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);

            if (status) qb.where('sub.status = :status', { status });

            return await qb.getManyAndCount();
        } catch (error) {
            this.logger.error('Error listing subscriptions', error);
            throw error;
        }
    }

    async findTrialsExpiringSoon(thresholdDate: Date, manager?: EntityManager): Promise<Subscription[]> {
        try {
            return await this.getRepo(manager).find({
                where: {
                    status: SubscriptionStatus.TRIAL,
                    trialEndDate: LessThanOrEqual(thresholdDate),
                },
                relations: ['plan'],
            });
        } catch (error) {
            this.logger.error('Error finding trials expiring soon', error);
            throw error;
        }
    }

    async findExpiredTrials(now: Date, manager?: EntityManager): Promise<Subscription[]> {
        try {
            return await this.getRepo(manager).find({
                where: {
                    status: SubscriptionStatus.TRIAL,
                    trialEndDate: LessThan(now),
                },
            });
        } catch (error) {
            this.logger.error('Error finding expired trials', error);
            throw error;
        }
    }

    async findSubscriptionsExpiringSoon(thresholdDate: Date, manager?: EntityManager): Promise<Subscription[]> {
        try {
            return await this.getRepo(manager).find({
                where: {
                    status: SubscriptionStatus.ACTIVE,
                    currentPeriodEnd: LessThanOrEqual(thresholdDate),
                },
                relations: ['plan'],
            });
        } catch (error) {
            this.logger.error('Error finding subscriptions expiring soon', error);
            throw error;
        }
    }

    async findExpiredSubscriptions(now: Date, manager?: EntityManager): Promise<Subscription[]> {
        try {
            return await this.getRepo(manager).find({
                where: [
                    { status: SubscriptionStatus.ACTIVE, currentPeriodEnd: LessThan(now) },
                    { status: SubscriptionStatus.PAST_DUE, currentPeriodEnd: LessThan(now) },
                ],
            });
        } catch (error) {
            this.logger.error('Error finding expired subscriptions', error);
            throw error;
        }
    }

    async create(data: Partial<Subscription>, manager?: EntityManager): Promise<Subscription> {
        try {
            const sub = this.getRepo(manager).create(data);
            return await this.getRepo(manager).save(sub);
        } catch (error) {
            this.logger.error(`Error creating subscription for user: ${data.userId}`, error);
            throw error;
        }
    }

    async update(id: string, data: Partial<Subscription>, manager?: EntityManager): Promise<void> {
        try {
            await this.getRepo(manager).update(id, data);
        } catch (error) {
            this.logger.error(`Error updating subscription: ${id}`, error);
            throw error;
        }
    }

    async bulkUpdateStatus(ids: string[], status: SubscriptionStatus, manager?: EntityManager): Promise<number> {
        try {
            const result = await this.getRepo(manager)
                .createQueryBuilder()
                .update(Subscription)
                .set({ status })
                .whereInIds(ids)
                .execute();
            return result.affected ?? 0;
        } catch (error) {
            this.logger.error('Error bulk updating subscription statuses', error);
            throw error;
        }
    }
}
