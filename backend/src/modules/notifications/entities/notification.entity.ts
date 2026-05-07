import { User } from '@/modules/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationType } from '../enums/notification.enum';

@Entity('notifications')
@Index(['userId', 'isRead', 'createdAt'])
@Index(['userId', 'type', 'isRead'])
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    @Index()
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type!: NotificationType;

    @Column({ length: 255 })
    title!: string;

    @Column({ type: 'text' })
    message!: string;

    @Column({
        type: 'jsonb',
        nullable: true,
        comment: 'Additional data (postId, quoteId, orderId...)',
    })
    metadata?: Record<string, any>;

    @Column({
        name: 'action_url',
        length: 500,
        nullable: true,
        comment: 'Deep link to navigate',
    })
    actionUrl?: string;

    @Column({ name: 'is_read', default: false })
    isRead: boolean = false;

    @Column({
        name: 'read_at',
        type: 'timestamp with time zone',
        nullable: true,
    })
    readAt?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    markAsRead(): void {
        if (!this.isRead) {
            this.isRead = true;
            this.readAt = new Date();
        }
    }

    isUnread(): boolean {
        return !this.isRead;
    }
}