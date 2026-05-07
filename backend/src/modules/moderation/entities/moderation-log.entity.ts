import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ModerationStatus, ViolationType } from '../interfaces/moderation.interface';

@Entity('moderation_logs')
@Index(['userId', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['entityType', 'entityId'])
export class ModerationLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    @Index()
    userId!: string;

    @Column({ name: 'entity_type', length: 50 })
    entityType!: string; 

    @Column({ name: 'entity_id', nullable: true })
    entityId?: string;

    @Column({ name: 'request_id' })
    requestId!: string;

    @Column({
        type: 'enum',
        enum: ModerationStatus,
    })
    status!: ModerationStatus;

    @Column({ name: 'is_allowed' })
    isAllowed!: boolean;

    @Column({ type: 'decimal', precision: 3, scale: 2 })
    confidence!: number;

    @Column({
        type: 'enum',
        enum: ViolationType,
        array: true,
        default: '{}',
        name: 'violation_types',
    })
    violationTypes: ViolationType[] = [];

    @Column({ type: 'jsonb', name: 'violations_detail', nullable: true })
    violationsDetail?: any;

    @Column({ type: 'text', name: 'original_title' })
    originalTitle!: string;

    @Column({ type: 'text', name: 'original_description' })
    originalDescription!: string;

    @Column({ type: 'jsonb', name: 'moderated_content', nullable: true })
    moderatedContent?: {
        title?: string;
        description?: string;
    };

    @Column({ type: 'jsonb' })
    metadata!: {
        model: string;
        processingTime: number;
        ipAddress?: string;
        userAgent?: string;
    };

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}