import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateConversationsTable1234567893 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'conversations',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'customer_id',
                        type: 'uuid',
                    },
                    {
                        name: 'provider_id',
                        type: 'uuid',
                    },
                    {
                        name: 'quote_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['quote_based', 'direct_request'],
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'last_message_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'last_message_preview',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'customer_unread_count',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'provider_unread_count',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Foreign Keys
        await queryRunner.createForeignKeys('conversations', [
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
            new TableForeignKey({
                columnNames: ['provider_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
            new TableForeignKey({
                columnNames: ['quote_id'],
                referencedTableName: 'quotes',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        ]);

        // Indexes
        await queryRunner.createIndices('conversations', [
            new TableIndex({
                name: 'idx_conversation_customer_provider',
                columnNames: ['customer_id', 'provider_id'],
            }),
            new TableIndex({
                name: 'idx_conversation_quote',
                columnNames: ['quote_id'],
                isUnique: true,
                where: 'quote_id IS NOT NULL',
            }),
            new TableIndex({
                name: 'idx_conversation_last_message',
                columnNames: ['last_message_at'],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('conversations');
    }
}