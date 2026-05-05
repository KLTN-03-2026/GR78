import { User } from '@/modules/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique
} from 'typeorm';

@Entity('refresh_tokens')
@Unique(['tokenHash'])
@Index('idx_user_active', ['userId', 'isRevoked', 'expiresAt'])
@Index('idx_user_device_active', ['userId', 'deviceId', 'isRevoked', 'expiresAt'])
@Index('idx_cleanup', ['isRevoked', 'expiresAt'])
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    @Index('idx_refresh_user')
    userId!: string;

    @ManyToOne(() => User, (u) => u.refreshTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'token_hash', length: 500 })
    tokenHash!: string;

    @Column({ name: 'device_id', length: 255, nullable: true })
    deviceId!: string | null;

    @Column({ type: 'timestamp with time zone', name: 'expires_at' })
    expiresAt!: Date;

    @Column({ name: 'is_revoked', default: false, nullable: true })
    isRevoked!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}