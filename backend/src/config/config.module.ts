import redisConfig from '@/config/redis.config';
import validationConfig from '@/config/validation.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import moderationConfig from './moderation.config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, moderationConfig],
      validationSchema: validationConfig,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
      ],
      validationOptions: {
        abortEarly: false, 
        allowUnknown: true, 
      },
    }),
  ],
})
export class AppConfigModule { }