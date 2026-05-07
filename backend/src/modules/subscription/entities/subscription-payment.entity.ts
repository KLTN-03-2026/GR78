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
import { SubscriptionPaymentStatus } from '../enums/subscription-payment-status.enum';
import { Discount } from './discount.entity';
import { Subscription } from './subscription.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

@Entity('subscription_payments')
@Index(['userId', 'status'])
@Index(['subscriptionId', 'createdAt'])
@Index(['status', 'dueDate'])
export class SubscriptionPayment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'subscription_id' })
    subscriptionId!: string;

    @ManyToOne(() => Subscription, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subscription_id' })
    subscription!: Subscription;

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
        type: 'decimal',
        precision: 12,
        scale: 2,
        comment: 'Original plan price before discount',
    })
    amount!: number;

    @Column({
        name: 'discount_id',
        nullable: true,
    })
    discountId?: string;

    @ManyToOne(() => Discount, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'discount_id' })
    discount?: Discount;

    @Column({
        name: 'discount_amount',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    })
    discountAmount: number = 0;

    @Column({
        name: 'final_amount',
        type: 'decimal',
        precision: 12,
        scale: 2,
        comment: 'Amount after discount',
    })
    finalAmount!: number;

    @Column({
        type: 'enum',
        enum: SubscriptionPaymentStatus,
        default: SubscriptionPaymentStatus.PENDING,
    })
    status: SubscriptionPaymentStatus = SubscriptionPaymentStatus.PENDING;

    @Column({
        name: 'due_date',
        type: 'timestamp with time zone',
        nullable: true,
    })
    dueDate?: Date;

    @Column({
        name: 'paid_at',
        type: 'timestamp with time zone',
        nullable: true,
    })
    paidAt?: Date;

    @Column({ name: 'stripe_payment_intent_id', type: 'varchar', nullable: true, unique: true })
    stripePaymentIntentId?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt!: Date;
}
