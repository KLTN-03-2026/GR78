import moderationConfig from '@/config/moderation.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationLog } from './entities/moderation-log.entity';
import { ModerationLogRepository } from './repositories/moderation-log.repository';
import { AIModerationService } from './services/al-moderation.service';
import { ModerationService } from './moderation.service';
import { OllamaModerationService } from './services/ollama-moderation.service';
import { QwenModerationService } from './services/qwen-moderation.service';

@Module({
    imports: [
        ConfigModule.forFeature(moderationConfig),
        TypeOrmModule.forFeature([ModerationLog]),
    ],
    providers: [
        OllamaModerationService,
        QwenModerationService,
        AIModerationService,
        ModerationService,
        ModerationLogRepository,
    ],
    exports: [
        ModerationService,
        ModerationLogRepository,
        AIModerationService, 
    ],
})
export class ModerationModule { }