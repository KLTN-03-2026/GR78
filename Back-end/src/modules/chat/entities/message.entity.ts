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
import { Conversation } from './conversation.entity';

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file',
    SYSTEM = 'system', 
}

@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['senderId'])
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'conversation_id' })
    @Index()
    conversationId!: string;

    @ManyToOne(() => Conversation, (c) => c.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation!: Conversation;

    @Column({ name: 'sender_id' })
    senderId!: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'sender_id' })
    sender!: User;

    @Column({
        type: 'enum',
        enum: MessageType,
        default: MessageType.TEXT,
    })
    type: MessageType = MessageType.TEXT;

    @Column({ type: 'text', nullable: true })
    content?: string;

    @Column({
        name: 'file_urls',
        type: 'text',
        array: true,
        nullable: true,
        default: '{}',
    })
    fileUrls: string[] = [];

    @Column({ name: 'file_names', type: 'text', array: true, nullable: true })
    fileNames?: string[];

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

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    // Helper methods
    markAsRead(): void {
        if (!this.isRead) {
            this.isRead = true;
            this.readAt = new Date();
        }
    }

    isOwnedBy(userId: string): boolean {
        return this.senderId === userId;
    }
}
