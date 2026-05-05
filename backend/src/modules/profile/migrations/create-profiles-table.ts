import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateProfilesTable1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'profiles',
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
                        isUnique: true,
                    },
                    {
                        name: 'full_name',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                        comment: 'User full legal name',
                    },
                    {
                        name: 'display_name',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                        comment: 'Public display name (changeable with restrictions)',
                    },
                    {
                        name: 'avatar_url',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                        comment: 'Profile picture URL',
                    },
                    {
                        name: 'bio',
                        type: 'text',
                        isNullable: true,
                        comment: 'User biography/description',
                    },
                    {
                        name: 'address',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                        comment: 'Physical address',
                    },
                    {
                        name: 'birthday',
                        type: 'date',
                        isNullable: true,
                        comment: 'Date of birth',
                    },
                    {
                        name: 'gender',
                        type: 'varchar',
                        length: '10',
                        isNullable: true,
                        comment: 'Gender: male, female, other',
                    },
                    {
                        name: 'last_display_name_change',
                        type: 'timestamp with time zone',
                        isNullable: true,
                        comment: 'Timestamp of last display name change',
                    },
                    {
                        name: 'display_name_change_count',
                        type: 'integer',
                        default: 0,
                        comment: 'Total number of display name changes',
                    },
                    {
                        name: 'display_name_history',
                        type: 'jsonb',
                        isNullable: true,
                        comment: 'History of display name changes for audit',
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true,
                        comment: 'Additional profile metadata',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp with time zone',
                        default: 'now()',
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'profiles',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                name: 'fk_profiles_user_id',
            }),
        );

        await queryRunner.createIndex(
            'profiles',
            new TableIndex({
                name: 'idx_profiles_user_id',
                columnNames: ['user_id'],
                isUnique: true,
            }),
        );

        await queryRunner.createIndex(
            'profiles',
            new TableIndex({
                name: 'idx_profiles_display_name',
                columnNames: ['display_name'],
            }),
        );

        await queryRunner.createIndex(
            'profiles',
            new TableIndex({
                name: 'idx_profiles_updated_at',
                columnNames: ['updated_at'],
            }),
        );

        await queryRunner.query(`
            INSERT INTO profiles (
                user_id,
                full_name,
                display_name,
                avatar_url,
                bio,
                address,
                birthday,
                gender,
                last_display_name_change,
                display_name_change_count,
                created_at,
                updated_at
            )
            SELECT 
                id,
                full_name,
                display_name,
                avatar_url,
                bio,
                address,
                birthday,
                gender,
                last_display_name_change,
                display_name_change_count,
                created_at,
                updated_at
            FROM users
            WHERE deleted_at IS NULL;
        `);

        

        await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE;
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN users.last_login_at IS 'Last successful login timestamp';
            COMMENT ON COLUMN users.failed_login_attempts IS 'Counter for failed login attempts (for security)';
            COMMENT ON COLUMN users.account_locked_until IS 'Temporary account lock timestamp (after too many failed attempts)';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('profiles', 'fk_profiles_user_id');

        await queryRunner.dropIndex('profiles', 'idx_profiles_user_id');
        await queryRunner.dropIndex('profiles', 'idx_profiles_display_name');
        await queryRunner.dropIndex('profiles', 'idx_profiles_updated_at');

        await queryRunner.dropTable('profiles');

        await queryRunner.query(`
            ALTER TABLE users 
            DROP COLUMN IF EXISTS last_login_at,
            DROP COLUMN IF EXISTS failed_login_attempts,
            DROP COLUMN IF EXISTS account_locked_until;
        `);

        
    }
}