import { User } from '@/modules/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { CustomRequestStatus } from '../enums/custom-request-status.enum';

@Entity('custom_requests')
@Index(['customerId', 'status'])
@Index(['providerId', 'status', 'createdAt'])
export class CustomRequest {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'customer_id' })
    @Index()
    customerId!: string;

    @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer!: User;

    @Column({ name: 'provider_id' })
    @Index()
    providerId!: string;

    @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'provider_id' })
    provider!: User;

    @Column({ length: 255 })
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({
        name: 'image_urls',
        type: 'text',
        array: true,
        nullable: true,
        default: '{}',
    })
    imageUrls: string[] = [];

    @Column({ length: 255, nullable: true })
    location?: string;

    @Column({
        type: 'timestamp with time zone',
        name: 'desired_time',
        nullable: true,
    })
    desiredTime?: Date;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    budget?: number;

    @Column({
        type: 'enum',
        enum: CustomRequestStatus,
        default: CustomRequestStatus.PENDING,
    })
    @Index()
    status: CustomRequestStatus = CustomRequestStatus.PENDING;

    @Column({ name: 'rejection_reason', type: 'text', nullable: true })
    rejectionReason?: string;

    @Column({
        name: 'accepted_at',
        type: 'timestamp with time zone',
        nullable: true,
    })
    acceptedAt?: Date;

    @Column({
        name: 'rejected_at',
        type: 'timestamp with time zone',
        nullable: true,
    })
    rejectedAt?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    isPending(): boolean {
        return this.status === CustomRequestStatus.PENDING && !this.deletedAt;
    }

    isAccepted(): boolean {
        return this.status === CustomRequestStatus.ACCEPTED;
    }

    isRejected(): boolean {
        return this.status === CustomRequestStatus.REJECTED;
    }

    belongsToCustomer(customerId: string): boolean {
        return this.customerId === customerId;
    }

    belongsToProvider(providerId: string): boolean {
        return this.providerId === providerId;
    }

    isParticipant(userId: string): boolean {
        return this.customerId === userId || this.providerId === userId;
    }
}
