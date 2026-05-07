import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { BillingCycle } from '../enums/billing-cycle.enum';
import { DiscountType } from '../enums/discount-type.enum';

@Entity('subscription_discounts')
@Index(['code'], { unique: true, where: '"is_active" = true' })
@Index(['isActive', 'validUntil'])
export class Discount {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 50, unique: true })
    code!: string;

    @Column({ length: 100 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({
        name: 'discount_type',
        type: 'enum',
        enum: DiscountType,
    })
    discountType!: DiscountType;

    @Column({
        name: 'discount_value',
        type: 'decimal',
        precision: 10,
        scale: 2,
        comment: 'Percentage (0-100) or fixed amount in VND',
    })
    discountValue!: number;

    @Column({
        name: 'applicable_billing_cycle',
        type: 'enum',
        enum: BillingCycle,
        nullable: true,
        comment: 'Null means applies to all billing cycles',
    })
    applicableBillingCycle?: BillingCycle;

    @Column({
        name: 'max_discount_amount',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
        comment: 'Cap for percentage discounts in VND',
    })
    maxDiscountAmount?: number;

    @Column({
        name: 'valid_from',
        type: 'timestamp with time zone',
    })
    validFrom!: Date;

    @Column({
        name: 'valid_until',
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Null means no expiry',
    })
    validUntil?: Date;

    @Column({
        name: 'usage_limit',
        type: 'int',
        nullable: true,
        comment: 'Null means unlimited',
    })
    usageLimit?: number;

    @Column({ name: 'usage_count', type: 'int', default: 0 })
    usageCount: number = 0;

    @Column({ name: 'is_active', default: true })
    isActive: boolean = true;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt!: Date;

    isValid(): boolean {
        if (!this.isActive) return false;
        const now = new Date();
        if (now < this.validFrom) return false;
        if (this.validUntil && now > this.validUntil) return false;
        if (this.usageLimit !== null && this.usageLimit !== undefined && this.usageCount >= this.usageLimit) return false;
        return true;
    }

    computeDiscountAmount(originalPrice: number): number {
        let amount: number;
        if (this.discountType === DiscountType.PERCENTAGE) {
            amount = (originalPrice * Number(this.discountValue)) / 100;
            if (this.maxDiscountAmount) {
                amount = Math.min(amount, Number(this.maxDiscountAmount));
            }
        } else {
            amount = Number(this.discountValue);
        }
        return Math.min(amount, originalPrice);
    }
}
