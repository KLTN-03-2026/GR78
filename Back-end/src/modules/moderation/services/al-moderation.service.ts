import { ModerationConfig } from '@/config/moderation.config';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModerationRequest, ModerationResult } from '../interfaces/moderation.interface';
import { OllamaModerationService } from './ollama-moderation.service';
import { QwenModerationService } from './qwen-moderation.service';


@Injectable()
export class AIModerationService {
    private readonly logger = new Logger(AIModerationService.name);
    private readonly config: ModerationConfig;

    constructor(
        private readonly configService: ConfigService,
        private readonly ollamaService: OllamaModerationService,
        private readonly qwenService: QwenModerationService,
    ) {
        this.config = this.configService.get<ModerationConfig>('moderation')!;
        this.logger.log(`AI Moderation Service initialized with provider: ${this.config.provider}`);
    }

    async moderateContent(request: ModerationRequest): Promise<ModerationResult> {
        if (!this.config.enabled) {
            this.logger.log('Moderation disabled, allowing content');
            return this.createDisabledResult();
        }

        switch (this.config.provider) {
            case 'qwen':
                this.logger.debug('Using Qwen Vietnamese Content Classifier provider');
                return this.qwenService.moderateContent(request);

            case 'ollama':
                this.logger.debug('Using Ollama provider');
                return this.ollamaService.moderateContent(request);

            default:
                this.logger.warn(`Unknown provider: ${this.config.provider}, using Qwen as default`);
                return this.qwenService.moderateContent(request);
        }
    }

    async checkHealth(): Promise<{
        provider: string;
        isHealthy: boolean;
        message: string;
    }> {
        try {
            const provider = this.config.provider;

            if (provider === 'qwen') {
                const isHealthy = await this.qwenService.checkHealth();
                return {
                    provider: 'qwen',
                    isHealthy,
                    message: isHealthy ? 'Qwen Vietnamese Content Classifier is operational' : 'Qwen service is down',
                };
            }

            if (provider === 'ollama') {
                const isHealthy = await this.ollamaService.checkHealth();
                return {
                    provider: 'ollama',
                    isHealthy,
                    message: isHealthy ? 'Ollama service is operational' : 'Ollama service is down',
                };
            }

            return {
                provider,
                isHealthy: true,
                message: 'Health check not implemented for this provider',
            };
        } catch (error) {
            this.logger.error('Health check failed', error);
            return {
                provider: this.config.provider,
                isHealthy: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    private createDisabledResult(): ModerationResult {
        return {
            status: 'APPROVED' as any,
            isAllowed: true,
            violations: [],
            confidence: 1.0,
            metadata: {
                model: 'disabled',
                processingTime: 0,
                timestamp: new Date(),
            },
        };
    }
}