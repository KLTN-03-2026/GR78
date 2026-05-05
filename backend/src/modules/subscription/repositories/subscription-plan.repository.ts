import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { BillingCycle } from '../enums/billing-cycle.enum';

@Injectable()
export class SubscriptionPlanRepository {
    private readonly logger = new Logger(SubscriptionPlanRepository.name);

    constructor(
        @InjectRepository(SubscriptionPlan)
        private readonly repo: Repository<SubscriptionPlan>,
    ) {}

    private getRepo(manager?: EntityManager): Repository<SubscriptionPlan> {
        return manager ? manager.getRepository(SubscriptionPlan) : this.repo;
    }

    async findAll(
        activeOnly = true,
        billingCycle?: BillingCycle,
        manager?: EntityManager,
    ): Promise<SubscriptionPlan[]> {
        try {
            const qb = this.getRepo(manager)
                .createQueryBuilder('plan')
                .orderBy('plan.sortOrder', 'ASC')
                .addOrderBy('plan.price', 'ASC');

            if (activeOnly) qb.andWhere('plan.isActive = true');
            if (billingCycle) qb.andWhere('plan.billingCycle = :billingCycle', { billingCycle });

            return await qb.getMany();
        } catch (error) {
            this.logger.error('Error fetching subscription plans', error);
            throw error;
        }
    }

    async findById(id: string, manager?: EntityManager): Promise<SubscriptionPlan | null> {
        try {
            return await this.getRepo(manager).findOne({ where: { id } });
        } catch (error) {
            this.logger.error(`Error finding plan: ${id}`, error);
            throw error;
        }
    }

    async findActiveById(id: string, manager?: EntityManager): Promise<SubscriptionPlan | null> {
        try {
            return await this.getRepo(manager).findOne({ where: { id, isActive: true } });
        } catch (error) {
            this.logger.error(`Error finding active plan: ${id}`, error);
            throw error;
        }
    }

    async create(data: Partial<SubscriptionPlan>, manager?: EntityManager): Promise<SubscriptionPlan> {
        try {
            const plan = this.getRepo(manager).create(data);
            return await this.getRepo(manager).save(plan);
        } catch (error) {
            this.logger.error('Error creating subscription plan', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<SubscriptionPlan>, manager?: EntityManager): Promise<SubscriptionPlan | null> {
        try {
            await this.getRepo(manager).update(id, data);
            return this.findById(id, manager);
        } catch (error) {
            this.logger.error(`Error updating plan: ${id}`, error);
            throw error;
        }
    }

    async softDelete(id: string, manager?: EntityManager): Promise<void> {
        try {
            await this.getRepo(manager).update(id, { isActive: false });
        } catch (error) {
            this.logger.error(`Error deactivating plan: ${id}`, error);
            throw error;
        }
    }

    async count(manager?: EntityManager): Promise<number> {
        try {
            return await this.getRepo(manager).count();
        } catch (error) {
            this.logger.error('Error counting plans', error);
            throw error;
        }
    }
}
