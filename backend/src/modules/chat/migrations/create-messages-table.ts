import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateMessagesTable1234567894 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'messages',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'conversation_id',
                        type: 'uuid',
                    },
                    {
                        name: 'sender_id',
                        type: 'varchar',
                        length: '255',
                        comment: 'user_id or "system"',
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['text', 'image', 'file', 'system'],
                        default: "'text'",
                    },
                    {
                        name: 'content',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'file_urls',
                        type: 'text',
                        isArray: true,
                        isNullable: true,
                        default: "'{}'",
                    },
                    {
                        name: 'file_names',
                        type: 'text',
                        isArray: true,
                        isNullable: true,
                    },
                    {
                        name: 'is_read',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'read_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
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

        // Foreign Key
        await queryRunner.createForeignKey(
            'messages',
            new TableForeignKey({
                columnNames: ['conversation_id'],
                referencedTableName: 'conversations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            })
        );

        // Indexes
        await queryRunner.createIndices('messages', [
            new TableIndex({
                name: 'idx_message_conversation_created',
                columnNames: ['conversation_id', 'created_at'],
            }),
            new TableIndex({
                name: 'idx_message_sender',
                columnNames: ['sender_id'],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('messages');
    }
}