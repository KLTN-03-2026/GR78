import { REDIS_CLIENT } from '@/modules/redis/redis.constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Namespace prefix for all profile cache keys.
 * Bump the version suffix (v1 → v2) to bust every key at once after a
 * data-model or response-shape change.
 */
const NS = 'svc:profile:v1';

/**
 * Cross-module search namespace — profile writes must also bust search results
 * that embed provider data, without creating a ProfileModule → SearchModule import.
 */
const SEARCH_NS = 'svc:search:v1';

/**
 * Per-key-type TTLs (seconds).
 *
 * Rationale:
 *  MY_PROFILE     300s — private profile; hot path after login; invalidated on every write
 *  PUBLIC_PROFILE 600s — read-heavy: many users can view one provider card; invalidated on write
 *  SEARCH         30s  — near-real-time discovery; display names must surface promptly
 */
const TTL = {
    MY_PROFILE: 300,
    PUBLIC_PROFILE: 600,
    SEARCH: 30,
} as const;

@Injectable()
export class ProfileCacheService {
    private readonly logger = new Logger(ProfileCacheService.name);
    readonly ttl = TTL;

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

    // ── Key builders ─────────────────────────────────────────────────────────────

    keyMyProfile(userId: string): string {
        return `${NS}:me:${userId}`;
    }

    keyPublicProfile(userId: string): string {
        return `${NS}:public:${userId}`;
    }

    /** Normalises the search term so "Điện" and "điện" share the same cache entry. */
    keySearch(searchTerm: string, limit: number, offset: number): string {
        return `${NS}:search:${this.norm(searchTerm)}:${limit}:${offset}`;
    }

    // ── Generic cache operations ──────────────────────────────────────────────────

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

    async del(...keys: string[]): Promise<void> {
        if (keys.length === 0) return;
        try {
            await this.redis.del(...keys);
        } catch (err) {
            this.logger.warn(`Cache DEL error [${keys.join(', ')}]: ${(err as Error).message}`);
        }
    }

    // ── SCAN-based pattern invalidation ──────────────────────────────────────────

    /**
     * Delete all keys matching a glob pattern using non-blocking SCAN.
     * Use this to invalidate an entire category of keys (e.g. all search pages).
     */
    async invalidatePattern(pattern: string): Promise<void> {
        try {
            let cursor = '0';
            do {
                const [next, keys] = await this.redis.scan(
                    cursor,
                    'MATCH',
                    pattern,
                    'COUNT',
                    100,
                );
                cursor = next;
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                    this.logger.debug(
                        `Invalidated ${keys.length} keys matching "${pattern}"`,
                    );
                }
            } while (cursor !== '0');
        } catch (err) {
            this.logger.warn(
                `Invalidation error for pattern "${pattern}": ${(err as Error).message}`,
            );
        }
    }

    // ── Domain-level invalidation helpers ────────────────────────────────────────

    /**
     * Called after any profile write that affects public-facing data
     * (bio, avatar, display name, profile fields).
     *
     * Busts:
     *  - own private profile cache
     *  - own public profile cache
     *  - all profile search pages (display names, bio change search relevance)
     *  - cross-module: search provider results and global/province pages
     *    that embed provider cards
     */
    async invalidateOnProfileWrite(userId: string): Promise<void> {
        await Promise.all([
            this.del(
                this.keyMyProfile(userId),
                this.keyPublicProfile(userId),
            ),
            this.invalidatePattern(`${NS}:search:*`),
            this.invalidatePattern(`${SEARCH_NS}:providers:*`),
            this.invalidatePattern(`${SEARCH_NS}:global:*`),
            this.invalidatePattern(`${SEARCH_NS}:province:*`),
        ]);
    }

    /**
     * Called after a contact update (email / phone only).
     * These fields are private and not reflected in public profile or search,
     * so only the owner's private cache needs busting.
     */
    async invalidateOnContactWrite(userId: string): Promise<void> {
        await this.del(this.keyMyProfile(userId));
    }

    /**
     * Called after account deletion.
     * Equivalent to a full profile write invalidation.
     */
    async invalidateOnDeleteAccount(userId: string): Promise<void> {
        await this.invalidateOnProfileWrite(userId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private norm(value: string): string {
        return value.trim().toLowerCase();
    }
}
