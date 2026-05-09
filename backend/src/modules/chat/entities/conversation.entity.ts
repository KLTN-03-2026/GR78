import { Quote } from '@/modules/quotes/entities/quote.entity';
import { User } from '@/modules/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';

export enum ConversationType {
    QUOTE_BASED = 'quote_based',
    DIRECT_REQUEST = 'direct_request',
    ORDER_CHAT = 'order_chat',
}

@Entity('conversations')
@Index(['quoteId'], { unique: true, where: 'quote_id IS NOT NULL' })
@Index(['lastMessageAt'])
// Composite indexes to serve ORDER BY last_message_at DESC for each participant column
@Index(['customerId', 'lastMessageAt'])
@Index(['providerId', 'lastMessageAt'])
// Enforce exactly one conversation per (customer, provider) pair at DB level, regardless of type.
// The app-level check does a fast SELECT first; the unique constraint is the last-resort safety net
// for concurrent inserts that both pass the app-level check (race condition).
@Index(['customerId', 'providerId'], { unique: true })
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'customer_id' })
    @Index()
    customerId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer!: User;

    @Column({ name: 'provider_id' })
    @Index()
    providerId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'provider_id' })
    provider!: User;

    @Column({ name: 'quote_id', nullable: true })
    quoteId?: string;

    @ManyToOne(() => Quote, { nullable: true })
    @JoinColumn({ name: 'quote_id' })
    quote?: Quote;

    @Column({ name: 'order_id', nullable: true, comment: 'Set for ORDER_CHAT type conversations' })
    @Index({ where: 'order_id IS NOT NULL', unique: true })
    orderId?: string;

    @Column({
        type: 'enum',
        enum: ConversationType,
    })
    type!: ConversationType;

    @Column({ name: 'is_active', default: true })
    isActive: boolean = true;

    @Column({
        name: 'last_message_at',
        type: 'timestamp with time zone',
        nullable: true,
    })
    lastMessageAt?: Date;

    @Column({ name: 'last_message_preview', type: 'text', nullable: true })
    lastMessagePreview?: string;

    @Column({ name: 'customer_unread_count', default: 0 })
    customerUnreadCount: number = 0;

    @Column({ name: 'provider_unread_count', default: 0 })
    providerUnreadCount: number = 0;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => Message, (m) => m.conversation)
    messages?: Message[];

    // Helper methods
    isParticipant(userId: string): boolean {
        return this.customerId === userId || this.providerId === userId;
    }

    getOtherUserId(userId: string): string {
        return this.customerId === userId ? this.providerId : this.customerId;
    }

    getUnreadCount(userId: string): number {
        return this.customerId === userId
            ? this.customerUnreadCount
            : this.providerUnreadCount;
    }
}