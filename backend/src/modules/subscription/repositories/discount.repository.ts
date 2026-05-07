import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Discount } from '../entities/discount.entity';
import { BillingCycle } from '../enums/billing-cycle.enum';

@Injectable()
export class DiscountRepository {
    private readonly logger = new Logger(DiscountRepository.name);

    constructor(
        @InjectRepository(Discount)
        private readonly repo: Repository<Discount>,
    ) {}

    private getRepo(manager?: EntityManager): Repository<Discount> {
        return manager ? manager.getRepository(Discount) : this.repo;
    }

    async findAll(
        activeOnly?: boolean,
        billingCycle?: BillingCycle,
        manager?: EntityManager,
    ): Promise<Discount[]> {
        try {
            const qb = this.getRepo(manager)
                .createQueryBuilder('discount')
                .orderBy('discount.createdAt', 'DESC');

            if (activeOnly) qb.andWhere('discount.isActive = true');
            if (billingCycle) {
                qb.andWhere(
                    '(discount.applicableBillingCycle = :billingCycle OR discount.applicableBillingCycle IS NULL)',
                    { billingCycle },
                );
            }

            return await qb.getMany();
        } catch (error) {
            this.logger.error('Error fetching discounts', error);
            throw error;
        }
    }

    async findById(id: string, manager?: EntityManager): Promise<Discount | null> {
        try {
            return await this.getRepo(manager).findOne({ where: { id } });
        } catch (error) {
            this.logger.error(`Error finding discount: ${id}`, error);
            throw error;
        }
    }

    async findByCode(code: string, manager?: EntityManager): Promise<Discount | null> {
        try {
            return await this.getRepo(manager).findOne({
                where: { code: code.toUpperCase() },
            });
        } catch (error) {
            this.logger.error(`Error finding discount by code: ${code}`, error);
            throw error;
        }
    }

    async create(data: Partial<Discount>, manager?: EntityManager): Promise<Discount> {
        try {
            const discount = this.getRepo(manager).create(data);
            return await this.getRepo(manager).save(discount);
        } catch (error) {
            this.logger.error('Error creating discount', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<Discount>, manager?: EntityManager): Promise<Discount | null> {
        try {
            await this.getRepo(manager).update(id, data);
            return this.findById(id, manager);
        } catch (error) {
            this.logger.error(`Error updating discount: ${id}`, error);
            throw error;
        }
    }

    async incrementUsage(id: string, manager?: EntityManager): Promise<void> {
        try {
            await this.getRepo(manager)
                .createQueryBuilder()
                .update(Discount)
                .set({ usageCount: () => 'usage_count + 1' })
                .where('id = :id', { id })
                .execute();
        } catch (error) {
            this.logger.error(`Error incrementing discount usage: ${id}`, error);
            throw error;
        }
    }

    async delete(id: string, manager?: EntityManager): Promise<void> {
        try {
            await this.getRepo(manager).delete(id);
        } catch (error) {
            this.logger.error(`Error deleting discount: ${id}`, error);
            throw error;
        }
    }
}
