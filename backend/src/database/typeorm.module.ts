import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from 'pg';
import { DatabaseBootstrapService } from './database-bootstrap.service';

const log = new Logger('DatabaseModule');

/**
 * Runs BEFORE TypeORM's synchronize step.
 *
 * Goal: ensure at most one conversation row exists per (customer_id, provider_id)
 * pair so the UNIQUE index TypeORM is about to create can be built without error.
 *
 * Idempotent design:
 *   • First boot (no table yet) → exits immediately, nothing to do.
 *   • Normal boot (no duplicates) → single fast EXISTS check, then exits.
 *   • First boot after schema migration → deletes newer duplicates (keeping the
 *     oldest conversation per pair) and their orphaned messages, then exits.
 *
 * NOTE: We intentionally do NOT check whether the unique index already exists.
 * The old schema had a *partial* unique index (WHERE type = 'direct_request') whose
 * pg_indexes.indexdef also contains "UNIQUE", "customer_id", and "provider_id" — so
 * that check produces a false positive and skips cleanup when duplicates still exist.
 * Checking for actual duplicate rows is unambiguous and equally cheap.
 */
async function deduplicateConversations(cfg: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}): Promise<void> {
    const client = new Client(cfg);
    try {
        await client.connect();

        // 1. Bail out if the table does not exist yet (first-ever boot).
        const { rows: tbl } = await client.query<{ exists: boolean }>(`
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name   = 'conversations'
            ) AS exists
        `);
        if (!tbl[0]?.exists) return;

        // 2. Fast path: no duplicates → nothing to clean, skip deletes entirely.
        const { rows: dup } = await client.query<{ has_duplicates: boolean }>(`
            SELECT EXISTS (
                SELECT 1
                FROM   conversations
                GROUP  BY customer_id, provider_id
                HAVING COUNT(*) > 1
            ) AS has_duplicates
        `);
        if (!dup[0]?.has_duplicates) return;

        // 3. Remove messages that belong to duplicate conversations first
        //    (FK constraint: messages.conversation_id → conversations.id).
        //    Keep the OLDEST conversation per pair (lowest created_at).
        const { rowCount: msgs } = await client.query(`
            DELETE FROM messages
            WHERE conversation_id IN (
                SELECT id
                FROM   conversations
                WHERE  id NOT IN (
                    SELECT DISTINCT ON (customer_id, provider_id) id
                    FROM   conversations
                    ORDER  BY customer_id, provider_id, created_at ASC
                )
            )
        `);

        // 4. Remove the duplicate conversation rows.
        const { rowCount: convs } = await client.query(`
            DELETE FROM conversations
            WHERE id NOT IN (
                SELECT DISTINCT ON (customer_id, provider_id) id
                FROM   conversations
                ORDER  BY customer_id, provider_id, created_at ASC
            )
        `);

        log.log(
            `Pre-sync cleanup: removed ${convs ?? 0} duplicate conversation(s) ` +
            `and ${msgs ?? 0} orphaned message(s).`,
        );
    } finally {
        await client.end();
    }
}

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => {
                const host = config.get<string>('DATABASE_HOST', 'localhost');
                const port = config.get<number>('DATABASE_PORT', 5432);
                const user = config.get<string>('DATABASE_USERNAME', 'postgres');
                const password = config.get<string>('DATABASE_PASSWORD') || '';
                const database = config.get<string>('DATABASE_NAME', 'service_matching');

                // Must complete before TypeORM calls synchronize().
                await deduplicateConversations({ host, port, user, password, database });

                return {
                    type: 'postgres',
                    host,
                    port,
                    username: user,
                    password,
                    database,
                    autoLoadEntities: true,
                    synchronize: true,
                    logging: process.env.NODE_ENV === 'development',
                    ssl: false,
                };
            },
        }),
    ],
    providers: [DatabaseBootstrapService],
})
export class TypeOrmDatabaseModule {}
