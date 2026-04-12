import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ProviderTrade } from './providertrade.entity';

@Entity('trades')
@Index(['slug'], { unique: true })
@Index(['isActive'])
export class Trade {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 100, unique: true })
    name!: string;

   
    @Column({ length: 100, unique: true })
    slug!: string;

    @Column({ length: 100, nullable: true })
    category?: string;

    @Column({ length: 10, nullable: true })
    icon?: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean = true;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number = 0;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

    @OneToMany(() => ProviderTrade, pt => pt.trade)
    providerTrades!: ProviderTrade[];
}