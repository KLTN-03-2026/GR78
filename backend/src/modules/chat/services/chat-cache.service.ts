import { REDIS_CLIENT } from '@/modules/redis/redis.constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Namespace for all chat cache keys.
 * Bump v1 → v2 to bust every key after a model/response-shape change.
 */
const NS = 'svc:chat:v1';

/**
 * Per-cache-type TTLs (seconds).
 *
 * CONVERSATION_IDS   60s  — used only at WS connect for room-join; new conversations
 *                           are joined on the fly via the join_conversation event.
 * UNREAD_COUNT       30s  — called on every connect; short TTL balances freshness vs DB load.
 * CONVERSATION_LIST  30s  — includes unread counts + lastMessagePreview, which change on
 *                           every message send or mark-read; must stay fresh.
 * CONVERSATION_DETAIL 60s — full conversation with user profiles and optional quote;
 *                           slightly less volatile than the paginated list view.
 * MESSAGES_LATEST    30s  — no-cursor page (initial load); clients receive new messages via
 *                           WebSocket push, so HTTP needs to serve only the initial snapshot.
 * MESSAGES_HISTORY  120s  — cursor-anchored history pages; they are append-only and safe to
 *                           hold longer, but sender profiles inside messages can change.
 */
const TTL = {
    CONVERSATION_IDS: 60,
    UNREAD_COUNT: 30,
    CONVERSATION_LIST: 30,
    CONVERSATION_DETAIL: 60,
    MESSAGES_LATEST: 30,
    MESSAGES_HISTORY: 120,
} as const;

@Injectable()
export class ChatCacheService {
    private readonly logger = new Logger(ChatCacheService.name);

    /** Expose TTLs so ChatService can reference them without duplication. */
    readonly ttl = TTL;

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

    // ── Key builders ──────────────────────────────────────────────────────────

    keyConversationIds(userId: string): string {
        return `${NS}:ids:${userId}`;
    }

    keyUnreadCount(userId: string): string {
        return `${NS}:unread:${userId}`;
    }

    keyConversationList(userId: string, page: number, limit: number): string {
        return `${NS}:convlist:${userId}:${page}:${limit}`;
    }

    keyConversationDetail(conversationId: string): string {
        return `${NS}:conv:${conversationId}`;
    }

    /**
     * Message page key.
     * Pages without a cursor are keyed as "latest" so they can be targeted
     * individually during invalidation without blowing away all history pages.
     */
    keyMessages(conversationId: string, limit: number, before?: string): string {
        return `${NS}:msgs:${conversationId}:${limit}:${before ?? 'latest'}`;
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
     * Uses cursor iteration so a single large keyspace does not block Redis.
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
     * Call after any message (user or system) is saved in a conversation.
     *
     * Busts:
     *  - all message pages for the conversation
     *  - the conversation detail (lastMessageAt, lastMessagePreview, unread counts changed)
     *  - both participants' conversation list pages (same reason)
     *  - both participants' unread count entries
     */
    async invalidateOnNewMessage(
        conversationId: string,
        customerId: string,
        providerId: string,
    ): Promise<void> {
        await Promise.all([
            this.invalidatePattern(`${NS}:msgs:${conversationId}:*`),
            this.del(this.keyConversationDetail(conversationId)),
            this.del(this.keyUnreadCount(customerId), this.keyUnreadCount(providerId)),
            this.invalidatePattern(`${NS}:convlist:${customerId}:*`),
            this.invalidatePattern(`${NS}:convlist:${providerId}:*`),
        ]);
    }

    /**
     * Call after markMessagesAsRead for a user.
     *
     * Busts:
     *  - conversation detail (unread count changed)
     *  - the reading user's conversation list pages
     *  - the reading user's unread count entry
     */
    async invalidateOnMessagesRead(conversationId: string, userId: string): Promise<void> {
        await Promise.all([
            this.del(this.keyConversationDetail(conversationId)),
            this.del(this.keyUnreadCount(userId)),
            this.invalidatePattern(`${NS}:convlist:${userId}:*`),
        ]);
    }

    /**
     * Call after a new conversation is created (before any messages are sent).
     *
     * Busts:
     *  - both participants' conversation-ID lists (room-join set is now stale)
     *  - both participants' conversation list pages
     */
    async invalidateOnNewConversation(customerId: string, providerId: string): Promise<void> {
        await Promise.all([
            this.del(this.keyConversationIds(customerId), this.keyConversationIds(providerId)),
            this.invalidatePattern(`${NS}:convlist:${customerId}:*`),
            this.invalidatePattern(`${NS}:convlist:${providerId}:*`),
        ]);
    }

    /**
     * Call after a conversation is closed or deleted — full bust.
     *
     * Busts everything scoped to this conversation and both participants.
     */
    async invalidateOnConversationChange(
        conversationId: string,
        customerId: string,
        providerId: string,
    ): Promise<void> {
        await Promise.all([
            this.invalidatePattern(`${NS}:msgs:${conversationId}:*`),
            this.del(this.keyConversationDetail(conversationId)),
            this.del(this.keyConversationIds(customerId), this.keyConversationIds(providerId)),
            this.del(this.keyUnreadCount(customerId), this.keyUnreadCount(providerId)),
            this.invalidatePattern(`${NS}:convlist:${customerId}:*`),
            this.invalidatePattern(`${NS}:convlist:${providerId}:*`),
        ]);
    }
}
