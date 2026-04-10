import { User } from '@/modules/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { Trade } from './trade.entity';


@Entity('provider_trades')
@Unique(['providerId', 'tradeId'])
@Index(['providerId'])
@Index(['tradeId'])
export class ProviderTrade {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'provider_id', type: 'uuid' })
    providerId!: string;

    @Column({ name: 'trade_id', type: 'uuid' })
    tradeId!: string;

    
    @Column({
        name: 'years_experience',
        type: 'smallint',
        nullable: true,
    })
    yearsExperience?: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

    @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'provider_id' })
    provider!: User;

    @ManyToOne(() => Trade, trade => trade.providerTrades, {
        eager: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'trade_id' })
    trade!: Trade;
}