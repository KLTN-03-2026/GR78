import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const password = config.get<string>('DATABASE_PASSWORD');

        return {
          type: 'postgres',
          host: config.get<string>('DATABASE_HOST', 'localhost'),
          port: config.get<number>('DATABASE_PORT', 5432),
          username: config.get<string>('DATABASE_USERNAME', 'postgres'),
          password: password || '',
          database: config.get<string>('DATABASE_NAME', 'service_matching'),
          autoLoadEntities: true,
          synchronize: true,
          logging: process.env.NODE_ENV === 'development',
          ssl: false,
        };
      },
    }),
  ],
})
export class TypeOrmDatabaseModule { }