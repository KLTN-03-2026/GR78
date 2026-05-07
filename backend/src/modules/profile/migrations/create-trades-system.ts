import { MigrationInterface, QueryRunner } from 'typeorm';


export class CreateTradesSystem1700000000001 implements MigrationInterface {
    name = 'CreateTradesSystem1700000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "trades" (
                "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
                "name"        VARCHAR(100) NOT NULL,
                "slug"        VARCHAR(100) NOT NULL,
                "category"    VARCHAR(100),
                "icon"        VARCHAR(10),
                "is_active"   BOOLEAN NOT NULL DEFAULT true,
                "sort_order"  SMALLINT NOT NULL DEFAULT 0,
                "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),

                CONSTRAINT "pk_trades" PRIMARY KEY ("id"),
                CONSTRAINT "uq_trades_name" UNIQUE ("name"),
                CONSTRAINT "uq_trades_slug" UNIQUE ("slug")
            );
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_trades_slug"
                ON "trades" ("slug");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_trades_is_active_sort"
                ON "trades" ("is_active", "sort_order");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_trades_category"
                ON "trades" ("category")
                WHERE "is_active" = true;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "provider_trades" (
                "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
                "provider_id"      UUID NOT NULL,
                "trade_id"         UUID NOT NULL,
                "years_experience" SMALLINT,
                "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),

                CONSTRAINT "pk_provider_trades" PRIMARY KEY ("id"),
                CONSTRAINT "uq_provider_trade" UNIQUE ("provider_id", "trade_id"),
                CONSTRAINT "fk_provider_trades_user"
                    FOREIGN KEY ("provider_id")
                    REFERENCES "users"("id")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_provider_trades_trade"
                    FOREIGN KEY ("trade_id")
                    REFERENCES "trades"("id")
                    ON DELETE CASCADE
            );
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_provider_trades_provider_id"
                ON "provider_trades" ("provider_id");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_provider_trades_trade_id"
                ON "provider_trades" ("trade_id");
        `);

        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_trades_name_fts"
                ON "trades"
                USING GIN (
                    to_tsvector('simple', immutable_unaccent("name"))
                )
                WHERE "is_active" = true;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "idx_trades_name_fts";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_provider_trades_trade_id";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_provider_trades_provider_id";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_trades_category";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_trades_is_active_sort";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_trades_slug";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "provider_trades";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "trades";`);
    }
}