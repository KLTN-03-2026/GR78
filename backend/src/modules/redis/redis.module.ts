import { Global, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: (config: ConfigService): Redis => {
                const logger = new Logger('RedisModule');

                const password = config.get<string>('redis.password');
                const client = new Redis({
                    host: config.get<string>('redis.host', 'localhost'),
                    port: config.get<number>('redis.port', 6379),
                    ...(password ? { password } : {}),
                    db: 0,
                    lazyConnect: false,
                    enableOfflineQueue: false,
                    maxRetriesPerRequest: 1,
                    connectTimeout: 5_000,
                    commandTimeout: 3_000,
                    retryStrategy: (times) => {
                        if (times > 10) return null;
                        return Math.min(times * 200, 3_000);
                    },
                });

                client.on('connect', () => logger.log('Redis connected'));
                client.on('ready', () => logger.log('Redis ready'));
                client.on('error', (err: Error) =>
                    logger.error(`Redis error: ${err.message}`),
                );
                client.on('close', () => logger.warn('Redis connection closed'));
                client.on('reconnecting', () => logger.warn('Redis reconnecting…'));

                return client;
            },
            inject: [ConfigService],
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
    constructor() {}

    async onApplicationShutdown(): Promise<void> {}
}
