import { registerAs } from '@nestjs/config';

export type ModerationProvider = 'ollama' | 'qwen';

export interface ModerationConfig {
    enabled: boolean;
    provider: ModerationProvider;

    // Ollama config
    ollama: {
        baseUrl: string;
        model: string;
        timeoutMs: number;
        maxRetries: number;
    };



    settings: {
        cacheTTL: number;
        enableCache: boolean;
        cacheProvider: 'redis' | 'memory';
    };

    thresholds: {
        sexual: number;
        violence: number;
        hate: number;
        harassment: number;
    };

    fallbackMode: 'allow' | 'block';
}

export default registerAs('moderation', (): ModerationConfig => ({
    enabled: process.env.MODERATION_ENABLED === 'true',
    provider: (process.env.MODERATION_PROVIDER as ModerationProvider) || 'qwen',

    ollama: {
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
        timeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS || '60000', 10),
        maxRetries: parseInt(process.env.OLLAMA_MAX_RETRIES || '5', 10),
    },


    settings: {
        cacheTTL: parseInt(process.env.MODERATION_CACHE_TTL || '3600', 10),
        enableCache: process.env.MODERATION_ENABLE_CACHE === 'true',
        cacheProvider: (process.env.MODERATION_CACHE_PROVIDER as any) || 'memory',
    },

    thresholds: {
        sexual: parseFloat(process.env.MODERATION_THRESHOLD_SEXUAL || '0.7'),
        violence: parseFloat(process.env.MODERATION_THRESHOLD_VIOLENCE || '0.7'),
        hate: parseFloat(process.env.MODERATION_THRESHOLD_HATE || '0.8'),
        harassment: parseFloat(process.env.MODERATION_THRESHOLD_HARASSMENT || '0.75'),
    },

    fallbackMode: (process.env.MODERATION_FALLBACK_MODE as any) || 'allow',
}));