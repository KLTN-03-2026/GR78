import { User } from '@/modules/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { Discount } from './discount.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

@Entity('subscriptions')
@Index(['userId', 'status'])
@Index(['status', 'currentPeriodEnd'])
@Index(['status', 'trialEndDate'])
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'plan_id', nullable: true })
    planId?: string;

    @ManyToOne(() => SubscriptionPlan, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'plan_id' })
    plan?: SubscriptionPlan;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.TRIAL,
    })
    status: SubscriptionStatus = SubscriptionStatus.TRIAL;

    @Column({
        name: 'trial_start_date',
        type: 'timestamp with time zone',
        nullable: true,
    })
    trialStartDate?: Date;

    @Column({
        name: 'trial_end_date',
        type: 'timestamp with time zone',
        nullable: true,
    })
    trialEndDate?: Date;

    @Column({
        name: 'current_period_start',
        type: 'timestamp with time zone',
        nullable: true,
    })
    currentPeriodStart?: Date;

    @Column({
        name: 'current_period_end',
        type: 'timestamp with time zone',
        nullable: true,
    })
    currentPeriodEnd?: Date;

    @Column({
        name: 'auto_renew',
        default: true,
        comment: 'Whether to send renewal reminder notifications',
    })
    autoRenew: boolean = true;

    @Column({ name: 'cancelled_at', type: 'timestamp with time zone', nullable: true })
    cancelledAt?: Date;

    @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
    cancellationReason?: string;

    @Column({ name: 'discount_id', nullable: true })
    discountId?: string;

    @ManyToOne(() => Discount, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'discount_id' })
    discount?: Discount;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt!: Date;

    isAccessAllowed(): boolean {
        return (
            this.status === SubscriptionStatus.TRIAL ||
            this.status === SubscriptionStatus.ACTIVE ||
            this.status === SubscriptionStatus.PAST_DUE
        );
    }

    isTrialActive(): boolean {
        if (this.status !== SubscriptionStatus.TRIAL) return false;
        if (!this.trialEndDate) return false;
        return new Date() <= this.trialEndDate;
    }

    daysUntilExpiry(): number {
        const endDate = this.status === SubscriptionStatus.TRIAL
            ? this.trialEndDate
            : this.currentPeriodEnd;
        if (!endDate) return 0;
        const diffMs = endDate.getTime() - Date.now();
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }
}
