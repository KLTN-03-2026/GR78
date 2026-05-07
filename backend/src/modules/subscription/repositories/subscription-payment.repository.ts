import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SubscriptionPayment } from '../entities/subscription-payment.entity';
import { SubscriptionPaymentStatus } from '../enums/subscription-payment-status.enum';

@Injectable()
export class SubscriptionPaymentRepository {
    private readonly logger = new Logger(SubscriptionPaymentRepository.name);

    constructor(
        @InjectRepository(SubscriptionPayment)
        private readonly repo: Repository<SubscriptionPayment>,
    ) {}

    private getRepo(manager?: EntityManager): Repository<SubscriptionPayment> {
        return manager ? manager.getRepository(SubscriptionPayment) : this.repo;
    }

    async findByUserId(
        userId: string,
        status?: SubscriptionPaymentStatus,
        page = 1,
        limit = 20,
        manager?: EntityManager,
    ): Promise<[SubscriptionPayment[], number]> {
        try {
            const qb = this.getRepo(manager)
                .createQueryBuilder('payment')
                .leftJoinAndSelect('payment.plan', 'plan')
                .leftJoinAndSelect('payment.discount', 'discount')
                .where('payment.userId = :userId', { userId })
                .orderBy('payment.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);

            if (status) qb.andWhere('payment.status = :status', { status });

            return await qb.getManyAndCount();
        } catch (error) {
            this.logger.error(`Error fetching payments for user: ${userId}`, error);
            throw error;
        }
    }

    async findAll(
        status?: SubscriptionPaymentStatus,
        page = 1,
        limit = 20,
        manager?: EntityManager,
    ): Promise<[SubscriptionPayment[], number]> {
        try {
            const qb = this.getRepo(manager)
                .createQueryBuilder('payment')
                .leftJoinAndSelect('payment.plan', 'plan')
                .leftJoinAndSelect('payment.discount', 'discount')
                .orderBy('payment.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);

            if (status) qb.where('payment.status = :status', { status });

            return await qb.getManyAndCount();
        } catch (error) {
            this.logger.error('Error fetching all payments', error);
            throw error;
        }
    }

    async findById(id: string, manager?: EntityManager): Promise<SubscriptionPayment | null> {
        try {
            return await this.getRepo(manager).findOne({
                where: { id },
                relations: ['plan', 'discount'],
            });
        } catch (error) {
            this.logger.error(`Error finding payment: ${id}`, error);
            throw error;
        }
    }

    async findPendingBySubscriptionId(
        subscriptionId: string,
        manager?: EntityManager,
    ): Promise<SubscriptionPayment | null> {
        try {
            return await this.getRepo(manager).findOne({
                where: { subscriptionId, status: SubscriptionPaymentStatus.PENDING },
                relations: ['plan'],
            });
        } catch (error) {
            this.logger.error(`Error finding pending payment for subscription: ${subscriptionId}`, error);
            throw error;
        }
    }

    async create(data: Partial<SubscriptionPayment>, manager?: EntityManager): Promise<SubscriptionPayment> {
        try {
            const payment = this.getRepo(manager).create(data);
            return await this.getRepo(manager).save(payment);
        } catch (error) {
            this.logger.error('Error creating payment record', error);
            throw error;
        }
    }

    async findByStripePaymentIntentId(
        stripePaymentIntentId: string,
        manager?: EntityManager,
    ): Promise<SubscriptionPayment | null> {
        try {
            return await this.getRepo(manager).findOne({
                where: { stripePaymentIntentId },
                relations: ['plan', 'discount'],
            });
        } catch (error) {
            this.logger.error(`Error finding payment by Stripe PI: ${stripePaymentIntentId}`, error);
            throw error;
        }
    }

    async delete(id: string, manager?: EntityManager): Promise<void> {
        try {
            await this.getRepo(manager).delete(id);
        } catch (error) {
            this.logger.error(`Error deleting payment: ${id}`, error);
            throw error;
        }
    }

    async update(id: string, data: Partial<SubscriptionPayment>, manager?: EntityManager): Promise<void> {
        try {
            await this.getRepo(manager).update(id, data);
        } catch (error) {
            this.logger.error(`Error updating payment: ${id}`, error);
            throw error;
        }
    }
}
