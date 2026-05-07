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


@Entity('password_reset_tokens')
@Index('idx_prt_token_hash', ['tokenHash'])
@Index('idx_prt_user_id', ['userId'])
@Index('idx_prt_cleanup', ['expiresAt', 'usedAt'])
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;


    @Column({ name: 'token_hash', length: 64, unique: true })
    tokenHash!: string;


    @Column({ name: 'ip_address', length: 45, nullable: true })
    ipAddress!: string | null;


    @Column({ name: 'expires_at', type: 'timestamp with time zone' })
    expiresAt!: Date;


    @Column({ name: 'used_at', type: 'timestamp with time zone', nullable: true })
    usedAt!: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isUsed(): boolean {
        return this.usedAt !== null;
    }

    isValid(): boolean {
        return !this.isExpired() && !this.isUsed();
    }
}