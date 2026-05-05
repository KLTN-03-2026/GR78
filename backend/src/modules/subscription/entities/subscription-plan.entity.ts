import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { BillingCycle } from '../enums/billing-cycle.enum';

@Entity('subscription_plans')
@Index(['billingCycle', 'isActive'])
export class SubscriptionPlan {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 100 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({
        name: 'billing_cycle',
        type: 'enum',
        enum: BillingCycle,
    })
    billingCycle!: BillingCycle;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        comment: 'Price in VND',
    })
    price!: number;

    @Column({
        type: 'jsonb',
        nullable: true,
        comment: 'Feature list displayed to the user',
    })
    features?: string[];

    @Column({ name: 'is_active', default: true })
    isActive: boolean = true;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number = 0;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt!: Date;

    getDurationDays(): number {
        return this.billingCycle === BillingCycle.MONTHLY ? 30 : 365;
    }
}
