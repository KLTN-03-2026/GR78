import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Enforces exactly one conversation per (customer_id, provider_id) pair, regardless of type.
 *
 * Before this migration the only unique guard was a partial index restricted to
 * type = 'direct_request', which allowed duplicate conversations for the same pair
 * when quotes or orders created new rows.
 *
 * Steps:
 *  1. Remove any duplicate pairs, keeping the oldest conversation per pair.
 *  2. Drop the old non-unique composite index and the old partial unique index.
 *  3. Create a single full unique index that covers all types.
 */
export class EnforceOneConversationPerPair1746789000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- 1. Deduplicate: keep the oldest row, soft-delete newer duplicates ---
        // We cannot hard-delete here because there may be messages referencing
        // the newer conversation IDs. Mark them inactive instead, then let admins
        // decide whether to migrate their messages later.
        await queryRunner.query(`
            UPDATE conversations
            SET is_active = false
            WHERE id NOT IN (
                SELECT DISTINCT ON (customer_id, provider_id) id
                FROM conversations
                ORDER BY customer_id, provider_id, created_at ASC
            )
        `);

        // Hard-delete the truly empty duplicates (no messages) so the unique
        // index below can be created without conflicts.
        await queryRunner.query(`
            DELETE FROM conversations
            WHERE is_active = false
              AND id NOT IN (SELECT DISTINCT conversation_id FROM messages)
        `);

        // If inactive duplicates that still have messages exist, the unique index
        // creation below will fail with a clear constraint error, which is safer
        // than silently dropping messages. Resolve those rows manually if needed.

        // --- 2. Drop legacy indexes ---
        // Non-unique composite index from the initial migration
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_conversation_customer_provider
        `);

        // Partial unique index that TypeORM may have created for the entity decorator
        // (name may vary; drop both known variants)
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_conversations_customer_provider_direct"
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS "conversations_customer_id_provider_id_where_type_direct_reques"
        `);

        // --- 3. Create the new full unique constraint ---
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_customer_provider_unique
            ON conversations (customer_id, provider_id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_conversation_customer_provider_unique`);

        await queryRunner.query(`
            CREATE INDEX idx_conversation_customer_provider
            ON conversations (customer_id, provider_id)
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "conversations_customer_id_provider_id_where_type_direct_reques"
            ON conversations (customer_id, provider_id)
            WHERE type = 'direct_request'
        `);
    }
}
