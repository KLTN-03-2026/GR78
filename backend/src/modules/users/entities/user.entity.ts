import { UserRole } from '@/common/enums/user-role.enum';
import { RefreshToken } from '@/modules/auth/entities/refresh-token.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';


@Entity('users')
@Index(['email'], { unique: true, where: 'deleted_at IS NULL' })
@Index(['phone'], { unique: true, where: 'deleted_at IS NULL AND phone IS NOT NULL' })
@Index(['role', 'deletedAt'])
@Index(['isActive', 'deletedAt'])
@Index(['createdAt'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ 
        length: 255, 
        nullable: true,
        comment: 'User email for authentication'
    })
    email?: string;

    @Column({ 
        length: 20, 
        nullable: true,
        comment: 'User phone for authentication'
    })
    phone?: string;

    @Column({
        name: 'password_hash',
        length: 255,
        nullable: true,
        select: false,
        comment: 'Hashed password - never select by default'
    })
    passwordHash?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
        comment: 'User role for authorization and access control'
    })
    role!: UserRole;

    @Column({
        name: 'is_verified',
        default: false,
        comment: 'Email/Phone verification status'
    })
    isVerified: boolean = false;

    @Column({
        name: 'is_active',
        default: true,
        comment: 'Account active status (can be deactivated by user or admin)'
    })
    isActive: boolean = true;

    @Column({
        name: 'last_login_at',
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Last successful login timestamp'
    })
    lastLoginAt?: Date;

    @Column({
        name: 'failed_login_attempts',
        type: 'int',
        default: 0,
        comment: 'Counter for failed login attempts (for security)'
    })
    failedLoginAttempts: number = 0;

    @Column({
        name: 'account_locked_until',
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Temporary account lock timestamp (after too many failed attempts)'
    })
    accountLockedUntil?: Date;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp with time zone'
    })
    createdAt!: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp with time zone'
    })
    updatedAt!: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamp with time zone'
    })
    deletedAt?: Date;

    @OneToOne(() => Profile, profile => profile.user, {
        cascade: true,
        eager: false
    })
    profile?: Profile;


    @OneToMany(() => RefreshToken, rt => rt.user, {
        cascade: true
    })
    refreshTokens?: RefreshToken[];

    isAdmin(): boolean {
        return this.role === UserRole.ADMIN;
    }

    isCustomer(): boolean {
        return this.role === UserRole.CUSTOMER;
    }

    isProvider(): boolean {
        return this.role === UserRole.PROVIDER;
    }

    isAccountLocked(): boolean {
        if (!this.accountLockedUntil) return false;
        return new Date() < this.accountLockedUntil;
    }

    canLogin(): boolean {
        return this.isActive &&
            !this.isAccountLocked() &&
            this.deletedAt === null;
    }
}