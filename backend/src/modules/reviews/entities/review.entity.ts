import { Order } from '@/modules/orders/entities/order.entity';
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

@Entity('reviews')
@Index(['revieweeId', 'createdAt'])
@Index(['reviewerId', 'createdAt'])
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'order_id', unique: true })
    @Index()
    orderId!: string;

    @ManyToOne(() => Order, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order!: Order;

    @Column({ name: 'reviewer_id' })
    @Index()
    reviewerId!: string;

    @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reviewer_id' })
    reviewer!: User;

    @Column({ name: 'reviewee_id' })
    @Index()
    revieweeId!: string;

    @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reviewee_id' })
    reviewee!: User;

    @Column({ type: 'int', comment: 'Rating from 1 to 5' })
    rating!: number;

    @Column({ type: 'text', nullable: true })
    comment?: string;

    @Column({ name: 'is_public', default: true })
    isPublic: boolean = true;

    @Column({ name: 'provider_reply', type: 'text', nullable: true })
    providerReply?: string;

    @Column({
        name: 'replied_at',
        type: 'timestamp with time zone',
        nullable: true,
    })
    repliedAt?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
