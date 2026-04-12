import { PostStatus } from '@/modules/posts/enums/post-status.enum';
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

@Entity('post_customer')
@Index(['status', 'deletedAt', 'createdAt'])
@Index(['customerId', 'status'])
export class PostCustomer {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

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
        nullable: true
    })
    desiredTime?: Date;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true
    })
    budget?: number;

    @Column({
        type: 'enum',
        enum: PostStatus,
        default: PostStatus.OPEN,
    })
    status: PostStatus = PostStatus.OPEN;

    @Column({ name: 'customer_id' })
    @Index()
    customerId!: string;

    @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer!: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    isOpen(): boolean {
        return this.status === PostStatus.OPEN && !this.deletedAt;
    }

    isClosed(): boolean {
        return this.status === PostStatus.CLOSED;
    }

    belongsTo(userId: string): boolean {
        return this.customerId === userId;
    }
}