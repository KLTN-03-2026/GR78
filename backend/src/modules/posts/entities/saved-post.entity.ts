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
import { PostCustomer } from './post.entity';


@Entity('saved_post')
@Index(['providerId', 'postId'], { unique: true })
@Index(['providerId', 'createdAt'])
export class SavedPost {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        name: 'provider_id',
        type: 'uuid',
    })
    providerId!: string;

    @Column({
        name: 'post_id',
        type: 'uuid',
    })
    postId!: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp with time zone',
    })
    createdAt!: Date;

    // Relations
    @ManyToOne(() => User, {
        eager: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'provider_id', referencedColumnName: 'id' })
    provider?: User;

    @ManyToOne(() => PostCustomer, {
        eager: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
    post?: PostCustomer;
}
