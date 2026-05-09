import { REDIS_CLIENT } from '@/modules/redis/redis.constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Namespace for all notification cache keys.
 * Bump v1 → v2 to bust every key after a model/response-shape change.
 */
const NS = 'svc:notif:v1';

/**
 * Per-cache-type TTLs (seconds).
 *
 * UNREAD_COUNT  30s  — polled frequently by the client notification badge and included
 *                      as a field in every list response; short TTL keeps it fresh.
 * LIST          30s  — paginated notification list; changes on every create, read, or delete.
 *                      30s is enough to absorb polling bursts while keeping UX latency low.
 */
const TTL = {
    UNREAD_COUNT: 30,
    LIST: 30,
} as const;

@Injectable()
export class NotificationCacheService {
    private readonly logger = new Logger(NotificationCacheService.name);

    /** Expose TTLs so query/action services can reference them without duplication. */
    readonly ttl = TTL;

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

    // ── Key builders ──────────────────────────────────────────────────────────

    keyUnreadCount(userId: string): string {
        return `${NS}:unread:${userId}`;
    }

    /**
     * List key encodes every dimension of the query so different pages/filters
     * never collide. unreadOnly is stored as '1'/'0' to keep keys short.
     */
    keyList(userId: string, page: number, limit: number, unreadOnly: boolean): string {
        return `${NS}:list:${userId}:${page}:${limit}:${unreadOnly ? '1' : '0'}`;
    }

    // ── Generic cache operations ──────────────────────────────────────────────

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
        try {
            if (keys.length > 0) await this.redis.del(...keys);
        } catch (err) {
            this.logger.warn(`Cache DEL error [${keys.join(', ')}]: ${(err as Error).message}`);
        }
    }

    /**
     * Non-blocking SCAN + DEL for pattern-based invalidation.
     * Uses cursor iteration so a single large keyspace never blocks Redis.
     */
    async invalidatePattern(pattern: string): Promise<void> {
        try {
            let cursor = '0';
            do {
                const [next, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                cursor = next;
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                    this.logger.debug(`Invalidated ${keys.length} keys for "${pattern}"`);
                }
            } while (cursor !== '0');
        } catch (err) {
            this.logger.warn(`Invalidation failed for "${pattern}": ${(err as Error).message}`);
        }
    }

    // ── Domain-level invalidation helpers ─────────────────────────────────────

    /**
     * Bust all notification caches for a user.
     *
     * Call this after any write that changes what the user sees:
     *   - notification created → unread count increases, list gains an item
     *   - mark as read (single or all) → unread count decreases, list items change
     *   - delete (single or bulk) → list changes, unread count may change
     */
    async invalidateForUser(userId: string): Promise<void> {
        await Promise.all([
            this.del(this.keyUnreadCount(userId)),
            this.invalidatePattern(`${NS}:list:${userId}:*`),
        ]);
    }

    /**
     * Bust caches for multiple users at once — used after bulk notification inserts
     * where each notification targets a different user.
     */
    async invalidateForUsers(userIds: string[]): Promise<void> {
        if (userIds.length === 0) return;
        const unique = [...new Set(userIds)];
        await Promise.all(unique.map(uid => this.invalidateForUser(uid)));
    }
}
