import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseBootstrapService implements OnModuleInit {
    private readonly logger = new Logger(DatabaseBootstrapService.name);

    constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

    async onModuleInit(): Promise<void> {
        await this.enableUnaccent();
    }

    private async enableUnaccent(): Promise<void> {
        try {
            await this.dataSource.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);
            await this.dataSource.query(`
                CREATE OR REPLACE FUNCTION immutable_unaccent(text)
                RETURNS text AS $$
                    SELECT unaccent($1)
                $$ LANGUAGE SQL IMMUTABLE STRICT PARALLEL SAFE
            `);
            this.logger.log('unaccent extension ready');
        } catch (err: any) {
            this.logger.error(
                `Failed to enable unaccent extension: ${err?.message}. ` +
                    'Accent-insensitive search will be unavailable. ' +
                    'Enable the extension manually with: CREATE EXTENSION unaccent;',
            );
        }
    }
}
