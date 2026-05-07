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
import { CertificationStatus } from '../enums/certification-status.enum';

@Entity('certifications')
@Index(['userId', 'verificationStatus'])
@Index(['userId', 'createdAt'])
export class Certification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id' })
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({
        length: 200,
        comment: 'Certificate title, e.g., Chứng chỉ hành nghề điện',
    })
    title!: string;

    @Column({
        name: 'issuing_organization',
        length: 200,
        nullable: true,
        comment: 'Issuing authority, e.g., Sở Xây Dựng TP.HCM',
    })
    issuingOrganization?: string;

    @Column({ name: 'issue_date', type: 'date', nullable: true })
    issueDate?: Date;

    @Column({
        name: 'expiry_date',
        type: 'date',
        nullable: true,
        comment: 'Null means no expiry',
    })
    expiryDate?: Date;

    @Column({ name: 'file_url', length: 500, comment: 'Supabase public URL' })
    fileUrl!: string;

    @Column({ name: 'file_name', length: 300, comment: 'Stored path used for deletion' })
    fileName!: string;

    @Column({ name: 'original_name', length: 300, nullable: true })
    originalName?: string;

    @Column({ name: 'file_size', type: 'int', nullable: true })
    fileSize?: number;

    @Column({
        name: 'verification_status',
        type: 'enum',
        enum: CertificationStatus,
        default: CertificationStatus.PENDING,
    })
    verificationStatus: CertificationStatus = CertificationStatus.PENDING;

    @Column({ name: 'rejection_reason', type: 'text', nullable: true })
    rejectionReason?: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp with time zone',
    })
    createdAt!: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp with time zone',
    })
    updatedAt!: Date;

    isVerified(): boolean {
        return this.verificationStatus === CertificationStatus.VERIFIED;
    }

    isExpired(): boolean {
        if (!this.expiryDate) return false;
        return new Date() > new Date(this.expiryDate);
    }
}
