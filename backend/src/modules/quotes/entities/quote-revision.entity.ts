import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Quote } from './quote.entity';

@Entity('quote_revisions')
@Index(['quoteId', 'createdAt'])
export class QuoteRevision {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'quote_id' })
    @Index()
    quoteId!: string;

    @ManyToOne(() => Quote, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quote_id' })
    quote!: Quote;

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
        name: 'revision_number',
        type: 'int',
        comment: 'Số lần chào giá (1, 2, 3...)',
    })
    revisionNumber!: number;

    @Column({
        name: 'changed_by',
        comment: 'Provider ID who made this revision',
    })
    changedBy!: string;

    @Column({ type: 'text', nullable: true })
    changeReason?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;


    @Column({ name: 'used_for_order_id', nullable: true })
    usedForOrderId?: string;

    @Column({ name: 'used_at', type: 'timestamp', nullable: true })
    usedAt?: Date;
}