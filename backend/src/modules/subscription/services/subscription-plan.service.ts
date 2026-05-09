import { Injectable, Logger } from '@nestjs/common';
import {
    CreateSubscriptionPlanDto,
    GetSubscriptionPlansQueryDto,
    UpdateSubscriptionPlanDto,
} from '../dtos/subscription-plan.dto';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import {
    SubscriptionPlanNotFoundException,
} from '../exceptions/subscription.exception';
import { SubscriptionPlanRepository } from '../repositories/subscription-plan.repository';

@Injectable()
export class SubscriptionPlanService {
    private readonly logger = new Logger(SubscriptionPlanService.name);

    constructor(private readonly planRepo: SubscriptionPlanRepository) {}

    async getPlans(query: GetSubscriptionPlansQueryDto): Promise<SubscriptionPlan[]> {
        return this.planRepo.findAll(
            query.activeOnly ?? true,
            query.billingCycle,
        );
    }

    async getPlanById(id: string): Promise<SubscriptionPlan> {
        const plan = await this.planRepo.findById(id);
        if (!plan) throw new SubscriptionPlanNotFoundException(id);
        return plan;
    }

    async createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
        const plan = await this.planRepo.create({
            name: dto.name,
            description: dto.description,
            billingCycle: dto.billingCycle,
            price: dto.price,
            features: dto.features,
            sortOrder: dto.sortOrder ?? 0,
            isActive: true,
        });

        this.logger.log(`Subscription plan created: ${plan.id} (${plan.name})`);
        return plan;
    }

    async updatePlan(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
        const existing = await this.planRepo.findById(id);
        if (!existing) throw new SubscriptionPlanNotFoundException(id);

        const updated = await this.planRepo.update(id, dto);
        this.logger.log(`Subscription plan updated: ${id}`);
        return updated!;
    }

    async deactivatePlan(id: string): Promise<void> {
        const existing = await this.planRepo.findById(id);
        if (!existing) throw new SubscriptionPlanNotFoundException(id);

        await this.planRepo.softDelete(id);
        this.logger.log(`Subscription plan deactivated: ${id}`);
    }
}
