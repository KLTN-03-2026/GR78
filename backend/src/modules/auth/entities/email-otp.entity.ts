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
import { OtpPurpose } from '../enums/otp-purpose.enum';

@Entity('email_otps')
@Index('idx_eotp_user_purpose', ['userId', 'purpose'])
@Index('idx_eotp_cleanup', ['expiresAt', 'usedAt'])
export class EmailOtp {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'email', length: 255 })
    email!: string;

    @Column({
        type: 'enum',
        enum: OtpPurpose,
    })
    purpose!: OtpPurpose;

    @Column({ name: 'otp_hash', length: 64 })
    otpHash!: string;

    @Column({ name: 'expires_at', type: 'timestamp with time zone' })
    expiresAt!: Date;

    @Column({ name: 'used_at', type: 'timestamp with time zone', nullable: true })
    usedAt!: Date | null;

    @Column({ name: 'attempts', default: 0 })
    attempts!: number;

    @Column({ name: 'ip_address', length: 45, nullable: true })
    ipAddress!: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isUsed(): boolean {
        return this.usedAt !== null;
    }

    isValid(): boolean {
        return !this.isExpired() && !this.isUsed() && this.attempts < 5;
    }
}
