import { PostCustomer } from '@/modules/posts/entities/post.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { ProviderTrade } from '@/modules/profile/entities/providertrade.entity';
import { Trade } from '@/modules/profile/entities/trade.entity';
import { Injectable } from '@nestjs/common';
import {
    PostSearchResultDto,
    ProviderSearchResultDto,
    TradeDto,
    VIETNAM_PROVINCES,
} from '../dtos/search.dto';
import { ProviderRow } from '../repositories/search.repository';

@Injectable()
export class SearchMapperService {


    toPostResult(post: PostCustomer, keyword?: string): PostSearchResultDto {
        const profile = (post.customer as any)?.profile as Profile | undefined;

        return {
            id: post.id,
            title: post.title,
            location: post.location,
            province: this.extractProvince(post.location),
            status: post.status,
            budget: post.budget != null ? Number(post.budget) : undefined,
            desiredTime: post.desiredTime,
            customer: {
                customerId: post.customerId,
                displayName: profile?.displayName ?? null,
                avatarUrl: profile?.avatarUrl ?? null,
            },
            createdAt: post.createdAt,
            highlight: keyword?.trim()
                ? this.buildHighlight(post.title, keyword.trim())
                : undefined,
        };
    }


    toProviderResult(row: ProviderRow): ProviderSearchResultDto {
        return {
            id: row.user.id,
            displayName: row.displayName,
            avatarUrl: row.avatarUrl,
            bio: row.bio ? this.truncate(row.bio, 120) : undefined,
            address: row.address,
            province: this.extractProvince(row.address),
            trades: this.mapTrades(row.providerTrades ?? []),
            isVerified: row.user.isVerified ?? false,
            memberSince: row.user.createdAt,
        };
    }


    toTradeDto(trade: Trade, yearsExperience?: number): TradeDto {
        return {
            id: trade.id,
            name: trade.name,
            slug: trade.slug,
            category: trade.category,
            icon: trade.icon,
            yearsExperience: yearsExperience ?? undefined,
        };
    }

   
    extractProvince(location?: string | null): string | undefined {
        if (!location?.trim()) return undefined;

        const norm = location.trim();
        const lower = norm.toLowerCase();

        const matched = VIETNAM_PROVINCES.find((p) =>
            lower.includes(p.toLowerCase()),
        );
        if (matched) return matched;

        const last = norm.split(',').pop()?.trim();
        return last || undefined;
    }

    
    buildHighlight(text: string, keyword: string): string {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const highlighted = text.replace(
            new RegExp(`(${escaped})`, 'gi'),
            '<em>$1</em>',
        );
        return this.truncate(highlighted, 200);
    }

    private mapTrades(providerTrades: ProviderTrade[]): TradeDto[] {
        return providerTrades
            .filter((pt) => pt.trade?.isActive !== false)
            .sort((a, b) => (a.trade?.sortOrder ?? 0) - (b.trade?.sortOrder ?? 0))
            .map((pt) => this.toTradeDto(pt.trade, pt.yearsExperience ?? undefined));
    }

    private truncate(str: string, max: number): string {
        return str.length <= max ? str : `${str.slice(0, max - 1)}…`;
    }
}