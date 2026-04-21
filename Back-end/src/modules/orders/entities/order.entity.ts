import { Quote } from '@/modules/quotes/entities/quote.entity';
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

export enum OrderStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    DISPUTED = 'disputed',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    REFUNDED = 'refunded',
}

export enum PaymentMethod {
    CASH = 'cash',
    CARD = 'card',
    BANK_TRANSFER = 'bank_transfer',
    WALLET = 'wallet',
}

@Entity('orders')
@Index(['customerId', 'status'])
@Index(['providerId', 'status'])
@Index(['status', 'createdAt'])
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'order_number', unique: true })
    @Index()
    orderNumber!: string;

    @Column({ name: 'customer_id' })
    @Index()
    customerId!: string;

    @ManyToOne(() => User, { eager: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'customer_id' })
    customer!: User;

    @Column({ name: 'provider_id' })
    @Index()
    providerId!: string;

    @ManyToOne(() => User, { eager: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'provider_id' })
    provider!: User;

    @Column({ name: 'quote_id', nullable: true })
    quoteId?: string;

    @ManyToOne(() => Quote, { nullable: true })
    @JoinColumn({ name: 'quote_id' })
    quote?: Quote;

    @Column({ length: 500 })
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
    })
    price!: number;

    @Column({
        name: 'service_fee',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
        comment: 'Phí nền tảng',
    })
    serviceFee: number = 0;

    @Column({
        name: 'total_amount',
        type: 'decimal',
        precision: 12,
        scale: 2,
        comment: 'Tổng tiền = price + serviceFee',
    })
    totalAmount!: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus = OrderStatus.PENDING;

    @Column({
        name: 'payment_status',
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus = PaymentStatus.PENDING;

    @Column({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
        nullable: true,
    })
    paymentMethod?: PaymentMethod;

    @Column({ length: 500, nullable: true })
    location?: string;

    @Column({
        name: 'scheduled_at',
        type: 'timestamp with time zone',
        nullable: true,
    })
    scheduledAt?: Date;

    @Column({
        name: 'estimated_duration',
        type: 'int',
        nullable: true,
        comment: 'Thời gian ước tính (phút)',
    })
    estimatedDuration?: number;

    @Column({
        name: 'started_at',
        type: 'timestamp with time zone',
        nullable: true,
    })
    startedAt?: Date;

    @Column({
        name: 'provider_completed_at',
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Thợ xác nhận hoàn thành',
    })
    providerCompletedAt?: Date;

    @Column({
        name: 'customer_completed_at',
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Khách xác nhận hoàn thành',
    })
    customerCompletedAt?: Date;

    @Column({
        name: 'completed_at',
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Hoàn thành (cả 2 bên đồng ý)',
    })
    completedAt?: Date;

    @Column({
        name: 'cancelled_at',
        type: 'timestamp with time zone',
        nullable: true,
    })
    cancelledAt?: Date;

    @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
    cancellationReason?: string;

    @Column({ name: 'cancelled_by', nullable: true })
    cancelledBy?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;


    @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
    paidAt?: Date;

    isPending(): boolean {
        return this.status === OrderStatus.PENDING;
    }

    isInProgress(): boolean {
        return this.status === OrderStatus.IN_PROGRESS;
    }

    isCompleted(): boolean {
        return this.status === OrderStatus.COMPLETED;
    }

    isCancelled(): boolean {
        return this.status === OrderStatus.CANCELLED;
    }

    canCancel(): boolean {
        if (this.status === OrderStatus.PENDING) {
            return true;
        }

        if (this.status === OrderStatus.IN_PROGRESS && this.startedAt) {
            const now = new Date();
            const minutesElapsed = (now.getTime() - this.startedAt.getTime()) / (1000 * 60);
            return minutesElapsed < 10;
        }

        return false;
    }

    belongsToCustomer(userId: string): boolean {
        return this.customerId === userId;
    }

    belongsToProvider(userId: string): boolean {
        return this.providerId === userId;
    }

    isParticipant(userId: string): boolean {
        return this.customerId === userId || this.providerId === userId;
    }

    canProviderComplete(): boolean {
        return this.status === OrderStatus.IN_PROGRESS &&
            !this.providerCompletedAt;
    }

    canCustomerComplete(): boolean {
        return this.status === OrderStatus.IN_PROGRESS &&
            this.providerCompletedAt !== null &&
            !this.customerCompletedAt;
    }
}