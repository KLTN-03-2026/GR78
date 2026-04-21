import { ModerationConfig } from '@/config/moderation.config';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    BLACKLIST_PATTERNS,
    SUSPICIOUS_PHRASES,
    SYSTEM_PROMPT
} from '../config/moderation-patterns.config';
import {
    ModerationAnalysis,
    ModerationRequest,
    ModerationResult,
    ModerationStatus,
    OllamaResponse,
    ViolationType,
} from '../interfaces/moderation.interface';


@Injectable()
export class OllamaModerationService {
    private readonly logger = new Logger(OllamaModerationService.name);
    private readonly config: ModerationConfig;
    private readonly baseUrl: string;

    private readonly BLACKLIST_PATTERNS = BLACKLIST_PATTERNS;
    private readonly SUSPICIOUS_PHRASES = SUSPICIOUS_PHRASES;

    constructor(private readonly configService: ConfigService) {
        this.config = this.configService.get<ModerationConfig>('moderation')!;
        this.baseUrl = this.config.ollama.baseUrl;

        this.logger.log(`Ollama moderation initialized: ${this.baseUrl}`);
        this.logger.log(`Using model: ${this.config.ollama.model}`);
    }

    async moderateContent(request: ModerationRequest): Promise<ModerationResult> {
        const startTime = Date.now();
        const requestId = request.requestId || this.generateRequestId();

        this.logger.log(`[${requestId}] Starting moderation for user: ${request.userId}`);

        try {
            if (!this.config.enabled) {
                return this.createApprovedResult(startTime);
            }

            const blacklistResult = this.quickBlacklistCheck(request);
            if (!blacklistResult.passed) {
                this.logger.warn(`[${requestId}] REJECTED by blacklist: ${blacklistResult.reason}`);
                return this.createBlacklistRejection(blacklistResult, startTime);
            }

            const riskScore = this.calculateRiskScore(request);
            this.logger.debug(`[${requestId}] Risk score: ${riskScore.toFixed(2)}`);

            if (riskScore < 0.3) {
                this.logger.log(`[${requestId}] Low risk (${riskScore.toFixed(2)}), auto-approved`);
                return this.createApprovedResult(startTime, riskScore);
            }


            const analysis = await this.callOllama(request, requestId, riskScore);

            const result = this.processAnalysis(analysis, startTime, requestId);

            this.logger.log(
                `[${requestId}] Completed: ${result.status} ` +
                `(confidence: ${result.confidence.toFixed(2)}, time: ${Date.now() - startTime}ms)`
            );

            return result;
        } catch (error) {
            this.logger.error(
                `[${requestId}] Error: ${error instanceof Error ? error.message : 'Unknown'}`,
                error instanceof Error ? error.stack : undefined
            );

            return this.handleModerationError(startTime);
        }
    }


    private quickBlacklistCheck(request: ModerationRequest): {
        passed: boolean;
        reason?: string;
        evidence?: string;
    } {
        const fullText = `${request.title} ${request.description || ''}`.toLowerCase();

        for (const pattern of this.BLACKLIST_PATTERNS) {
            const match = fullText.match(pattern);
            if (match) {
                return {
                    passed: false,
                    reason: 'Chứa từ ngữ cấm rõ ràng',
                    evidence: match[0]
                };
            }
        }

        return { passed: true };
    }


    private calculateRiskScore(request: ModerationRequest): number {
        const fullText = `${request.title} ${request.description || ''}`.toLowerCase();
        let score = 0;

        let suspiciousCount = 0;
        for (const phrase of this.SUSPICIOUS_PHRASES) {
            if (fullText.includes(phrase)) {
                suspiciousCount++;
            }
        }

        score += Math.min(suspiciousCount * 0.15, 0.6);

        const dangerousCombos = [
            ['massage', 'kín đáo'],
            ['massage', 'tận nơi'],
            ['dịch vụ', 'đêm'],
            ['dịch vụ', 'khuya'],
            ['spa', 'vip'],
            ['thư giãn', 'toàn thân'],
            ['phục vụ', '24/7'],
            ['giá', 'triệu', 'đêm'],
        ];

        for (const combo of dangerousCombos) {
            if (combo.every(word => fullText.includes(word))) {
                score += 0.25;
            }
        }

        if (/\d+\s*(triệu|tr|k|nghìn)/i.test(fullText)) {
            if (fullText.includes('đêm') || fullText.includes('giờ') || fullText.includes('lần')) {
                score += 0.3;
            }
        }

        if (fullText.length < 50 && suspiciousCount > 2) {
            score += 0.2;
        }

        return Math.min(score, 1.0);
    }

    private async callOllama(
        request: ModerationRequest,
        requestId: string,
        riskScore: number
    ): Promise<ModerationAnalysis> {
        const systemPrompt = this.buildOptimizedSystemPrompt();
        const userPrompt = this.buildOptimizedUserPrompt(request, riskScore);

        this.logger.debug(`[${requestId}] Calling Ollama API (risk: ${riskScore.toFixed(2)})`);

        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            this.config.ollama.timeoutMs
        );

        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.config.ollama.model,
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt,
                        },
                        {
                            role: 'user',
                            content: userPrompt,
                        },
                    ],
                    stream: false,
                    options: {
                        temperature: 0.1,
                        top_p: 0.85,
                        num_predict: 400,
                        repeat_penalty: 1.1,
                    },
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }

            const data: OllamaResponse = await response.json();
            const content = data.message.content.trim();

            this.logger.debug(`[${requestId}] AI response: ${content.substring(0, 150)}...`);

            const parsed = this.extractJSON(content, requestId);

            if (typeof parsed.approved !== 'boolean') {
                throw new Error('Invalid AI response: missing approved field');
            }

            if (typeof parsed.confidence !== 'number') {
                parsed.confidence = parsed.approved ? 0.7 : 0.8;
            }

            parsed.risk_score = riskScore;

            return parsed;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Ollama request timeout');
            }

            throw error;
        }
    }

    private extractJSON(content: string, requestId: string): ModerationAnalysis {
        let jsonStr = content;

        if (content.includes('```')) {
            const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            jsonStr = match ? match[1].trim() : content;
        }

        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        try {
            return JSON.parse(jsonStr) as ModerationAnalysis;
        } catch (e) {
            this.logger.error(`[${requestId}] JSON parse failed: ${e}`);
            return {
                approved: false,
                confidence: 0.5,
                violations: [{
                    type: 'UNKNOWN',
                    severity: 0.5,
                    reason: 'AI response parse error',
                    location: 'both'
                }],
            };
        }
    }

    private buildOptimizedSystemPrompt(): string {
        return SYSTEM_PROMPT;
    }

    private buildOptimizedUserPrompt(request: ModerationRequest, riskScore: number): string {
        return `Risk score: ${riskScore.toFixed(2)}

TIÊU ĐỀ: ${request.title}

MÔ TẢ: ${request.description || '(Không có)'}

Trả về JSON, không giải thích gì thêm.`;
    }

    private processAnalysis(
        analysis: ModerationAnalysis,
        startTime: number,
        requestId: string
    ): ModerationResult {
        const violations = (analysis.violations || []).map(v => ({
            type: v.type as ViolationType,
            severity: v.severity,
            reason: v.reason,
            location: v.location as 'title' | 'description' | 'both',
            evidence: v.evidence,
        }));

        const criticalViolations = violations.filter(v => {
            const threshold = this.getThresholdForType(v.type);
            return v.severity >= threshold;
        });

        let finalApproved = analysis.approved;
        let finalConfidence = analysis.confidence;

        if (criticalViolations.length > 0) {
            finalApproved = false;
            finalConfidence = Math.max(...criticalViolations.map(v => v.severity));

            this.logger.warn(
                `[${requestId}] REJECTED: ${criticalViolations.length} critical violations`
            );
        }

        if (analysis.approved && (analysis.risk_score || 0) > 0.7) {
            this.logger.warn(
                `[${requestId}] WARNING: AI approved but high risk score (${analysis.risk_score?.toFixed(2)})`
            );
        }

        return this.buildModerationResult(
            finalApproved,
            finalConfidence,
            criticalViolations,
            startTime,
            requestId
        );
    }

    private buildModerationResult(
        approved: boolean,
        confidence: number,
        violations: Array<any>,
        startTime: number,
        requestId: string
    ): ModerationResult {
        const processingTime = Date.now() - startTime;

        this.logger.log(
            `[${requestId}] Result: ${approved ? 'APPROVED' : 'REJECTED'} ` +
            `(confidence: ${confidence.toFixed(2)}, violations: ${violations.length}, time: ${processingTime}ms)`
        );

        if (!approved && violations.length > 0) {
            this.logger.warn(
                `[${requestId}] Violations:\n` +
                violations.map(v =>
                    `  - ${v.type} (${v.severity.toFixed(2)}): ${v.reason}` +
                    (v.evidence ? `\n    Evidence: "${v.evidence}"` : '')
                ).join('\n')
            );
        }

        return {
            status: approved ? ModerationStatus.APPROVED : ModerationStatus.REJECTED,
            isAllowed: approved,
            violations,
            confidence,
            metadata: {
                model: this.config.ollama.model,
                processingTime,
                timestamp: new Date(),
            },
        };
    }

    private getThresholdForType(type: string): number {
        const typeUpper = type.toUpperCase();
        switch (typeUpper) {
            case 'PROSTITUTION':
                return 0.55;
            case 'SEXUAL':
                return this.config.thresholds.sexual || 0.7;
            case 'BDSM':
                return 0.7;
            case 'VIOLENCE':
                return this.config.thresholds.violence || 0.8;
            case 'HATE':
                return this.config.thresholds.hate || 0.8;
            case 'HARASSMENT':
                return this.config.thresholds.harassment || 0.7;
            default:
                return 0.7;
        }
    }

    private createApprovedResult(startTime: number, riskScore: number = 0): ModerationResult {
        return {
            status: ModerationStatus.APPROVED,
            isAllowed: true,
            violations: [],
            confidence: 1.0 - riskScore * 0.2,
            metadata: {
                model: this.config.ollama.model,
                processingTime: Date.now() - startTime,
                timestamp: new Date(),
            },
        };
    }

    private createBlacklistRejection(
        blacklistResult: { reason?: string; evidence?: string },
        startTime: number
    ): ModerationResult {
        return {
            status: ModerationStatus.REJECTED,
            isAllowed: false,
            violations: [{
                type: 'SEXUAL' as ViolationType,
                severity: 1.0,
                reason: blacklistResult.reason || 'Chứa từ ngữ cấm',
                location: 'both',
                evidence: blacklistResult.evidence,
            }],
            confidence: 1.0,
            metadata: {
                model: 'blacklist',
                processingTime: Date.now() - startTime,
                timestamp: new Date(),
            },
        };
    }

    private handleModerationError(startTime: number): ModerationResult {
        const fallbackMode = this.config.fallbackMode;

        this.logger.error(`Moderation error, using fallback mode: ${fallbackMode}`);

        const shouldBlock = fallbackMode === 'block';

        return {
            status: ModerationStatus.ERROR,
            isAllowed: !shouldBlock,
            violations: [],
            confidence: 0,
            metadata: {
                model: 'error-fallback',
                processingTime: Date.now() - startTime,
                timestamp: new Date(),
            },
        };
    }

    private generateRequestId(): string {
        return `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000),
            });

            return response.ok;
        } catch (error) {
            this.logger.error('Ollama health check failed', error);
            return false;
        }
    }
}