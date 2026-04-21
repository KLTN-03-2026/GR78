import { User } from '@/modules/users/entities/user.entity';
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity('profiles')
@Index(['userId'], { unique: true })
@Index(['displayName'])
@Index(['updatedAt'])
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        name: 'user_id',
        type: 'uuid',
        unique: true
    })
    userId!: string;

    @Column({  
        name: 'full_name',
        length: 255,
        nullable: true,
        comment: 'User full legal name'
    })
    fullName?: string;

    @Column({
        name: 'display_name',
        length: 100,
        nullable: true,
        comment: 'Public display name (changeable with restrictions)'
    })
    displayName?: string;

    @Column({
        name: 'avatar_url',
        length: 500,
        nullable: true,
        comment: 'Profile picture URL'
    })
    avatarUrl?: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: 'User biography/description'
    })
    bio?: string;

    @Column({
        length: 255,
        nullable: true,
        comment: 'Physical address'
    })
    address?: string;

    @Column({
        type: 'date',
        nullable: true,
        comment: 'Date of birth'
    })
    birthday?: Date;

    @Column({
        length: 10,
        nullable: true,
        comment: 'Gender: male, female, other'
    })
    gender?: string;

    @Column({
        name: 'last_display_name_change',
        type: 'timestamp with time zone',
        nullable: true,
        comment: 'Timestamp of last display name change'
    })
    lastDisplayNameChange?: Date;

    @Column({
        name: 'display_name_change_count',
        type: 'int',
        default: 0,
        comment: 'Total number of display name changes'
    })
    displayNameChangeCount: number = 0;

    @Column({
        name: 'display_name_history',
        type: 'jsonb',
        nullable: true,
        comment: 'History of display name changes for audit'
    })
    displayNameHistory?: Array<{
        name: string;
        changedAt: Date;
    }>;

    @Column({
        type: 'jsonb',
        nullable: true,
        comment: 'Additional profile metadata (preferences, settings, etc.)'
    })
    metadata?: Record<string, any>;

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

    @OneToOne(() => User, user => user.profile, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @BeforeInsert()
    setDefaults() {
        if (!this.displayName && this.fullName) {
            this.displayName = this.fullName;
        }
        if (!this.displayNameHistory) {
            this.displayNameHistory = [];
        }
    }

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date();
    }

    canChangeDisplayName(): boolean {
        if (!this.lastDisplayNameChange) return true;

        const daysSinceLastChange = this.getDaysSinceLastDisplayNameChange();
        return daysSinceLastChange >= 30;
    }

    getDaysSinceLastDisplayNameChange(): number {
        if (!this.lastDisplayNameChange) return Infinity;

        const now = new Date();
        const lastChange = new Date(this.lastDisplayNameChange);
        const diffTime = Math.abs(now.getTime() - lastChange.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    getDaysUntilCanChangeDisplayName(): number {
        if (!this.lastDisplayNameChange) return 0;

        const daysSinceLastChange = this.getDaysSinceLastDisplayNameChange();
        return Math.max(0, 30 - daysSinceLastChange);
    }

    addDisplayNameToHistory(oldName: string | undefined, newName: string): void {
        if (!this.displayNameHistory) {
            this.displayNameHistory = [];
        }

        if (this.displayNameHistory.length >= 10) {
            this.displayNameHistory.shift();
        }

        this.displayNameHistory.push({
            name: newName,
            changedAt: new Date()
        });
    }

    getAge(): number | null {
        if (!this.birthday) return null;

        const today = new Date();
        const birthDate = new Date(this.birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    isProfileComplete(): boolean {
        return !!(
            this.fullName &&
            this.displayName &&
            this.birthday &&
            this.gender
        );
    }
}