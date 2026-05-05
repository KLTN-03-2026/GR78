import { REDIS_CLIENT } from '@/modules/redis/redis.constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import {
    ByProvinceQueryDto,
    GlobalSearchQueryDto,
    PostSearchQueryDto,
    ProviderSearchQueryDto,
    TradeSuggestQueryDto,
} from '../dtos/search.dto';

/**
 * Namespace prefix for all search cache keys.
 * Bump the version suffix (v1 → v2) to bust every key at once
 * after a data-model or response-shape change.
 */
const NS = 'svc:search:v1';

/**
 * Per-endpoint TTLs (seconds).
 *
 * Rationale:
 *  GLOBAL  30s  — search-bar UX; users expect near-real-time results
 *  POSTS   60s  — listing pages; new posts appear within a minute
 *  PROVIDERS 120s — provider profiles change less frequently
 *  PROVINCE  120s — browse-by-area; same cadence as provider data
 *  TRADES  3600s — trade catalog is near-static; changes require admin action
 */
const TTL = {
    GLOBAL: 30,
    POSTS: 60,
    PROVIDERS: 120,
    PROVINCE: 120,
    TRADES: 3_600,
} as const;

@Injectable()
export class SearchCacheService {
    private readonly logger = new Logger(SearchCacheService.name);

    /** Expose TTLs so SearchService can reference them without duplication. */
    readonly ttl = TTL;

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

    // ── Key builders ────────────────────────────────────────────────────────────

    keyGlobal(dto: GlobalSearchQueryDto): string {
        return [
            NS,
            'global',
            this.norm(dto.q),
            dto.type ?? 'all',
            dto.province ?? '-',
            dto.limit ?? 5,
        ].join(':');
    }

    keyPosts(dto: PostSearchQueryDto): string {
        const slugs = [...(dto.tradeSlugs ?? [])].sort().join(',') || '-';
        return [
            NS,
            'posts',
            this.norm(dto.title ?? '-'),
            dto.province ?? '-',
            slugs,
            dto.status ?? 'OPEN',
            dto.budgetMin ?? '-',
            dto.budgetMax ?? '-',
            dto.sortBy ?? 'createdAt',
            dto.order ?? 'desc',
            dto.limit ?? 10,
            dto.offset ?? 0,
        ].join(':');
    }

    keyProviders(dto: ProviderSearchQueryDto): string {
        const slugs = [...(dto.tradeSlugs ?? [])].sort().join(',') || '-';
        return [
            NS,
            'providers',
            this.norm(dto.displayName ?? '-'),
            dto.province ?? '-',
            slugs,
            dto.sortBy ?? 'createdAt',
            dto.order ?? 'desc',
            dto.limit ?? 20,
            dto.offset ?? 0,
        ].join(':');
    }

    keyProvince(dto: ByProvinceQueryDto): string {
        return [NS, 'province', dto.province, dto.postLimit ?? 10, dto.providerLimit ?? 10].join(
            ':',
        );
    }

    keyTrades(dto: TradeSuggestQueryDto): string {
        return [NS, 'trades', this.norm(dto.q ?? '-'), dto.category ?? '-'].join(':');
    }

    // ── Generic cache operations ─────────────────────────────────────────────────

    async get<T>(key: string): Promise<T | null> {
        try {
            const raw = await this.redis.get(key);
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch (err) {
            this.logger.warn(`Cache GET error [${key}]: ${(err as Error).message}`);
            return null;
        }
    }

    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
        try {
            await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        } catch (err) {
            this.logger.warn(`Cache SET error [${key}]: ${(err as Error).message}`);
        }
    }

    // ── Cache invalidation helpers ───────────────────────────────────────────────

    /**
     * Delete all keys matching a pattern using non-blocking SCAN.
     * Use for invalidating a category of results (e.g. after a post is updated).
     * Pattern examples: "svc:search:v1:posts:*", "svc:search:v1:global:*"
     */
    async invalidatePattern(pattern: string): Promise<void> {
        try {
            let cursor = '0';
            do {
                const [next, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                cursor = next;
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                    this.logger.debug(`Invalidated ${keys.length} keys for pattern "${pattern}"`);
                }
            } while (cursor !== '0');
        } catch (err) {
            this.logger.warn(
                `Cache invalidation failed for pattern "${pattern}": ${(err as Error).message}`,
            );
        }
    }

    async invalidatePosts(): Promise<void> {
        await Promise.all([
            this.invalidatePattern(`${NS}:posts:*`),
            this.invalidatePattern(`${NS}:global:*`),
            this.invalidatePattern(`${NS}:province:*`),
        ]);
    }

    async invalidateProviders(): Promise<void> {
        await Promise.all([
            this.invalidatePattern(`${NS}:providers:*`),
            this.invalidatePattern(`${NS}:global:*`),
            this.invalidatePattern(`${NS}:province:*`),
        ]);
    }

    async invalidateTrades(): Promise<void> {
        await this.invalidatePattern(`${NS}:trades:*`);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    /** Lowercase + trim so "Điện" and "điện" share the same cache entry. */
    private norm(value: string): string {
        return value.trim().toLowerCase();
    }
}
