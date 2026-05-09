    import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

    export class CreateNotificationsTable1234567891 implements MigrationInterface {
        public async up(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.createTable(
                new Table({
                    name: 'notifications',
                    columns: [
                        {
                            name: 'id',
                            type: 'uuid',
                            isPrimary: true,
                            generationStrategy: 'uuid',
                            default: 'uuid_generate_v4()',
                        },
                        {
                            name: 'user_id',
                            type: 'uuid',
                        },
                        {
                            name: 'type',
                            type: 'varchar',
                            length: '50',
                        },
                        {
                            name: 'title',
                            type: 'varchar',
                            length: '255',
                        },
                        {
                            name: 'message',
                            type: 'text',
                        },
                        {
                            name: 'metadata',
                            type: 'jsonb',
                            isNullable: true,
                            comment: 'Additional data (postId, quoteId, orderId...)',
                        },
                        {
                            name: 'action_url',
                            type: 'varchar',
                            length: '500',
                            isNullable: true,
                            comment: 'Deep link to navigate',
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
                    ],
                }),
                true
            );


            await queryRunner.createForeignKey(
                'notifications',
                new TableForeignKey({
                    columnNames: ['user_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                })
            );

            //Index
            await queryRunner.createIndex(
                'notifications',
                new TableIndex({
                    name: 'idx_notification_user_read_created',
                    columnNames: ['user_id', 'is_read', 'created_at'],
                })
            );

            await queryRunner.createIndex(
                'notifications',
                new TableIndex({
                    name: 'idx_notification_user_type_read',
                    columnNames: ['user_id', 'type', 'is_read'],
                })
            );

            await queryRunner.createIndex(
                'notifications',
                new TableIndex({
                    name: 'idx_notification_user_id',
                    columnNames: ['user_id'],
                })
            );
        }

        public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.dropTable('notifications');
        }
    }