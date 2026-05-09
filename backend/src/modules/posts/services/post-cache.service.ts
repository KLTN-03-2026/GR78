import { REDIS_CLIENT } from '@/modules/redis/redis.constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Namespace prefix for all post cache keys.
 * Bump the version suffix (v1 → v2) to bust every key at once after a
 * data-model or response-shape change.
 */
const NS = 'svc:posts:v1';

/**
 * Search namespace — posts/close operations must also bust search results
 * that embed post data, without creating a PostsModule → SearchModule import.
 */
const SEARCH_NS = 'svc:search:v1';

/**
 * Per-key-type TTLs (seconds).
 *
 * Rationale:
 *  POST      60s  — single post detail; changes only on owner update/close/delete
 *  FEED      30s  — public feed; new posts must appear within ~30 s for good UX
 *  MY_POSTS  20s  — per-customer list; short TTL since the user just created a post
 *  SAVED_LIST 30s — per-provider saved list; moderate churn
 *  SAVED_CHECK 60s — boolean is-saved per provider+post; cheap to recompute
 *  SAVED_COUNT 60s — total saved count per provider
 */
const TTL = {
    POST: 60,
    FEED: 30,
    MY_POSTS: 20,
    SAVED_LIST: 30,
    SAVED_CHECK: 60,
    SAVED_COUNT: 60,
} as const;

@Injectable()
export class PostCacheService {
    private readonly logger = new Logger(PostCacheService.name);
    readonly ttl = TTL;

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

    // ── Key builders ─────────────────────────────────────────────────────────────

    keyPost(id: string): string {
        return `${NS}:post:${id}`;
    }

    keyFeed(limit: number, cursor?: string): string {
        return `${NS}:feed:${cursor ?? '-'}:${limit}`;
    }

    keyMyPosts(userId: string, limit: number, cursor?: string): string {
        return `${NS}:mine:${userId}:${cursor ?? '-'}:${limit}`;
    }

    keySavedList(providerId: string, limit: number, cursor?: string): string {
        return `${NS}:saved:list:${providerId}:${cursor ?? '-'}:${limit}`;
    }

    keySavedCheck(providerId: string, postId: string): string {
        return `${NS}:saved:check:${providerId}:${postId}`;
    }

    keySavedCount(providerId: string): string {
        return `${NS}:saved:count:${providerId}`;
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
     * Use this for invalidating an entire category of keys (e.g. all feed pages).
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
     * Called after a new post is created.
     * Busts: public feed pages, the author's personal list, and related search keys.
     */
    async invalidateOnPostCreate(customerId: string): Promise<void> {
        await Promise.all([
            this.invalidatePattern(`${NS}:feed:*`),
            this.invalidatePattern(`${NS}:mine:${customerId}:*`),
            this.invalidatePattern(`${SEARCH_NS}:posts:*`),
            this.invalidatePattern(`${SEARCH_NS}:global:*`),
            this.invalidatePattern(`${SEARCH_NS}:province:*`),
        ]);
    }

    /**
     * Called after a post is updated, closed, or deleted.
     * Busts: single post, public feed pages, the author's personal list, and search.
     */
    async invalidateOnPostWrite(postId: string, customerId: string): Promise<void> {
        await Promise.all([
            this.del(this.keyPost(postId)),
            this.invalidatePattern(`${NS}:feed:*`),
            this.invalidatePattern(`${NS}:mine:${customerId}:*`),
            this.invalidatePattern(`${SEARCH_NS}:posts:*`),
            this.invalidatePattern(`${SEARCH_NS}:global:*`),
            this.invalidatePattern(`${SEARCH_NS}:province:*`),
        ]);
    }

    /**
     * Called after a provider saves or unsaves a post.
     * Busts: the provider's saved list pages, the is-saved flag, and count.
     */
    async invalidateOnSavedChange(providerId: string, postId: string): Promise<void> {
        await Promise.all([
            this.invalidatePattern(`${NS}:saved:list:${providerId}:*`),
            this.del(
                this.keySavedCheck(providerId, postId),
                this.keySavedCount(providerId),
            ),
        ]);
    }
}
