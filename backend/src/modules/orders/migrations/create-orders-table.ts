import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateOrdersTable1234567895 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'orders',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'order_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
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
                        name: 'title',
                        type: 'varchar',
                        length: '500',
                    },
                    {
                        name: 'description',
                        type: 'text',
                    },
                    {
                        name: 'price',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                    },
                    {
                        name: 'service_fee',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: 'total_amount',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['pending', 'in_progress', 'completed', 'cancelled', 'disputed'],
                        default: "'pending'",
                    },
                    {
                        name: 'payment_status',
                        type: 'enum',
                        enum: ['pending', 'paid', 'refunded'],
                        default: "'pending'",
                    },
                    {
                        name: 'payment_method',
                        type: 'enum',
                        enum: ['cash', 'card', 'bank_transfer', 'wallet'],
                        isNullable: true,
                    },
                    {
                        name: 'location',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'scheduled_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'estimated_duration',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'started_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'provider_completed_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'customer_completed_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'completed_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'cancelled_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'cancellation_reason',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'cancelled_by',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'notes',
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
                ],
            }),
            true
        );

        // Foreign Keys
        await queryRunner.createForeignKeys('orders', [
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
            new TableForeignKey({
                columnNames: ['provider_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
            new TableForeignKey({
                columnNames: ['quote_id'],
                referencedTableName: 'quotes',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        ]);

        // Indexes
        await queryRunner.createIndices('orders', [
            new TableIndex({
                name: 'idx_order_number',
                columnNames: ['order_number'],
                isUnique: true,
            }),
            new TableIndex({
                name: 'idx_order_customer_status',
                columnNames: ['customer_id', 'status'],
            }),
            new TableIndex({
                name: 'idx_order_provider_status',
                columnNames: ['provider_id', 'status'],
            }),
            new TableIndex({
                name: 'idx_order_status_created',
                columnNames: ['status', 'created_at'],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('orders');
    }
}
