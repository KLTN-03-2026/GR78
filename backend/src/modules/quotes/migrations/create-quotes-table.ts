import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateQuotesTable1234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'quotes',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'post_id',
                        type: 'uuid',
                    },
                    {
                        name: 'provider_id',
                        type: 'uuid',
                    },
                    {
                        name: 'price',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                    },
                    {
                        name: 'description',
                        type: 'text',
                    },
                    {
                        name: 'terms',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'estimated_duration',
                        type: 'int',
                        isNullable: true,
                        comment: 'Estimated completion time (minutes)',
                    },
                    {
                        name: 'image_urls',
                        type: 'text',
                        isArray: true,
                        default: "'{}'",
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
                        default: "'pending'",
                    },
                    {
                        name: 'accepted_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'rejected_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'cancelled_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'rejection_reason',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'cancellation_reason',
                        type: 'text',
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
                    {
                        name: 'deleted_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                ],
            }),
            true
        );

      
        await queryRunner.createForeignKey(
            'quotes',
            new TableForeignKey({
                columnNames: ['post_id'],
                referencedTableName: 'post_customer',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'quotes',
            new TableForeignKey({
                columnNames: ['provider_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            })
        );

        //Index
        await queryRunner.createIndex(
            'quotes',
            new TableIndex({
                name: 'idx_quote_post_provider_status',
                columnNames: ['post_id', 'provider_id', 'status'],
            })
        );

        await queryRunner.createIndex(
            'quotes',
            new TableIndex({
                name: 'idx_quote_provider_status_created',
                columnNames: ['provider_id', 'status', 'created_at'],
            })
        );

        await queryRunner.createIndex(
            'quotes',
            new TableIndex({
                name: 'idx_quote_post_status_created',
                columnNames: ['post_id', 'status', 'created_at'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('quotes');
    }
}