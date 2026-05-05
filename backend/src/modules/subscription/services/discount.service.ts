import { Injectable, Logger } from '@nestjs/common';
import {
    CreateDiscountDto,
    DiscountValidationResultDto,
    GetDiscountsQueryDto,
    UpdateDiscountDto,
} from '../dtos/discount.dto';
import { Discount } from '../entities/discount.entity';
import {
    DiscountCodeAlreadyExistsException,
    DiscountNotFoundException,
    InvalidDiscountException,
} from '../exceptions/subscription.exception';
import { DiscountRepository } from '../repositories/discount.repository';
import { BillingCycle } from '../enums/billing-cycle.enum';

@Injectable()
export class DiscountService {
    private readonly logger = new Logger(DiscountService.name);

    constructor(private readonly discountRepo: DiscountRepository) {}

    async getDiscounts(query: GetDiscountsQueryDto): Promise<Discount[]> {
        return this.discountRepo.findAll(query.activeOnly, query.billingCycle);
    }

    async getDiscountById(id: string): Promise<Discount> {
        const discount = await this.discountRepo.findById(id);
        if (!discount) throw new DiscountNotFoundException();
        return discount;
    }

    async createDiscount(dto: CreateDiscountDto): Promise<Discount> {
        const code = dto.code.toUpperCase();
        const existing = await this.discountRepo.findByCode(code);
        if (existing) throw new DiscountCodeAlreadyExistsException(code);

        const discount = await this.discountRepo.create({
            ...dto,
            code,
            usageCount: 0,
            isActive: true,
        });

        this.logger.log(`Discount created: ${discount.id} (${discount.code})`);
        return discount;
    }

    async updateDiscount(id: string, dto: UpdateDiscountDto): Promise<Discount> {
        const existing = await this.discountRepo.findById(id);
        if (!existing) throw new DiscountNotFoundException();

        const updated = await this.discountRepo.update(id, dto);
        this.logger.log(`Discount updated: ${id}`);
        return updated!;
    }

    async deleteDiscount(id: string): Promise<void> {
        const existing = await this.discountRepo.findById(id);
        if (!existing) throw new DiscountNotFoundException();

        await this.discountRepo.delete(id);
        this.logger.log(`Discount deleted: ${id}`);
    }

    async validateDiscountCode(
        code: string,
        billingCycle: BillingCycle,
        planPrice: number,
    ): Promise<DiscountValidationResultDto> {
        const discount = await this.discountRepo.findByCode(code);

        if (!discount || !discount.isValid()) {
            return { valid: false, message: 'Discount code is invalid or has expired' };
        }

        if (
            discount.applicableBillingCycle &&
            discount.applicableBillingCycle !== billingCycle
        ) {
            return {
                valid: false,
                message: `This discount is only valid for ${discount.applicableBillingCycle} plans`,
            };
        }

        const discountAmount = discount.computeDiscountAmount(planPrice);
        const finalAmount = planPrice - discountAmount;

        return {
            valid: true,
            discountAmount,
            finalAmount,
            discount: discount as any,
        };
    }

    async getValidDiscountByCode(code: string, billingCycle: BillingCycle): Promise<Discount> {
        const discount = await this.discountRepo.findByCode(code);
        if (!discount) throw new DiscountNotFoundException(code);
        if (!discount.isValid()) throw new InvalidDiscountException();

        if (
            discount.applicableBillingCycle &&
            discount.applicableBillingCycle !== billingCycle
        ) {
            throw new InvalidDiscountException(
                `This discount is only valid for ${discount.applicableBillingCycle} plans`,
            );
        }

        return discount;
    }
}
