import { PostCustomer } from '@/modules/posts/entities/post.entity';
import { User } from '@/modules/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { QuoteStatus } from '../enums/quote-status.enum';
import { QuoteRevision } from './quote-revision.entity';

@Entity('quotes')
@Index(['postId', 'providerId', 'status'])
@Index(['providerId', 'status', 'createdAt'])
@Index(['postId', 'status', 'createdAt'])
export class Quote {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'post_id' })
    @Index()
    postId!: string;

    @ManyToOne(() => PostCustomer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    post!: PostCustomer;

    @Column({ name: 'provider_id' })
    @Index()
    providerId!: string;

    @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'provider_id' })
    provider!: User;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
    })
    price!: number;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'text', nullable: true })
    terms?: string;

    @Column({
        name: 'estimated_duration',
        type: 'int',
        nullable: true,
        comment: 'Estimated completion time (minutes)'
    })
    estimatedDuration?: number;

    @Column({
        name: 'image_urls',
        type: 'text',
        array: true,
        nullable: true,
        default: '{}',
    })
    imageUrls: string[] = [];

    @Column({
        type: 'enum',
        enum: QuoteStatus,
        default: QuoteStatus.PENDING,
    })
    @Index()
    status: QuoteStatus = QuoteStatus.PENDING;

    @Column({
        name: 'revision_count',
        type: 'int',
        default: 1,
        comment: 'Số lần đã chào giá (bắt đầu từ 1)',
    })
    revisionCount: number = 1;

    @OneToMany(() => QuoteRevision, (revision) => revision.quote, { cascade: true })
    revisions!: QuoteRevision[];

    @Column({
        name: 'chat_opened_at',
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Thời điểm khách chấp nhận và mở chat',
    })
    chatOpenedAt?: Date;

    @Column({
        name: 'order_requested_at',
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Thời điểm khách nhấn đặt đơn với revision hiện tại',
    })
    orderRequestedAt?: Date;

    @Column({
        name: 'accepted_at',
        type: 'timestamp with time zone',
        nullable: true
    })
    acceptedAt?: Date;

    @Column({
        name: 'rejected_at',
        type: 'timestamp with time zone',
        nullable: true
    })
    rejectedAt?: Date;

    @Column({
        name: 'cancelled_at',
        type: 'timestamp with time zone',
        nullable: true
    })
    cancelledAt?: Date;

    @Column({
        name: 'confirmed_at',
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Thời điểm thợ xác nhận làm (tạo order)',
    })
    confirmedAt?: Date;

    @Column({
        name: 'rejection_reason',
        type: 'text',
        nullable: true
    })
    rejectionReason?: string;

    @Column({
        name: 'cancellation_reason',
        type: 'text',
        nullable: true
    })
    cancellationReason?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;


    isPending(): boolean {
        return this.status === QuoteStatus.PENDING && !this.deletedAt;
    }

    isAcceptedForChat(): boolean {
        return this.status === QuoteStatus.ACCEPTED_FOR_CHAT;
    }

    isRevising(): boolean {
        return this.status === QuoteStatus.REVISING;
    }

    isOrderRequested(): boolean {
        return this.status === QuoteStatus.ORDER_REQUESTED;
    }

    isConfirmed(): boolean {
        return this.status === QuoteStatus.CONFIRMED;
    }

    isRejected(): boolean {
        return this.status === QuoteStatus.REJECTED;
    }

    isCancelled(): boolean {
        return this.status === QuoteStatus.CANCELLED;
    }

    canEdit(): boolean {
        return this.status === QuoteStatus.PENDING && !this.deletedAt;
    }

    canRevise(): boolean {
        return (
            this.status === QuoteStatus.ACCEPTED_FOR_CHAT ||
            this.status === QuoteStatus.REVISING
        ) && !this.deletedAt;
    }

    canCancel(): boolean {
        return (
            this.status === QuoteStatus.PENDING ||
            this.status === QuoteStatus.ACCEPTED_FOR_CHAT ||
            this.status === QuoteStatus.REVISING ||
            this.status === QuoteStatus.ORDER_REQUESTED
        ) && !this.deletedAt;
    }

    canRequestOrder(): boolean {
        return (
            this.status === QuoteStatus.ACCEPTED_FOR_CHAT ||
            this.status === QuoteStatus.REVISING
        ) && !this.deletedAt;
    }

    canConfirmOrder(): boolean {
        return this.status === QuoteStatus.ORDER_REQUESTED && !this.deletedAt;
    }

    belongsTo(providerId: string): boolean {
        return this.providerId === providerId;
    }

    isActive(): boolean {
        return !this.deletedAt &&
            this.status !== QuoteStatus.REJECTED &&
            this.status !== QuoteStatus.CANCELLED &&
            this.status !== QuoteStatus.CONFIRMED;
    }
}