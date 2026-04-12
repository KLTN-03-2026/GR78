import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import { ModerationRequest, ModerationResult, ModerationStatus, ViolationType } from '../interfaces/moderation.interface';

const execAsync = promisify(exec);

interface QwenPrediction {
    prediction: 'prostitution' | 'sexual' | 'violence' | 'hate' | 'safe';
    confidence: number;
    is_safe: boolean;
    should_block: boolean;
    inference_time_ms: number;
    all_scores?: Record<string, number>;
}

@Injectable()
export class QwenModerationService {
    private readonly logger = new Logger(QwenModerationService.name);
    private readonly modelPath: string;
    private readonly pythonScriptPath: string;
    private readonly pythonBin: string;

    constructor() {
        // Try merged model first, fallback to adapter
        const mergedModelPath = join(process.cwd(), 'models', 'vietnamese-content-classifier-final-merged');

        // Check if merged model exists (simplified check)
        this.modelPath = mergedModelPath; // inference_api.py will handle fallback
        this.pythonScriptPath = join(process.cwd(), 'models', 'inference_api.py');

        // Python binary - adjust based on your setup
        this.pythonBin = process.env.PYTHON_BIN || '/Users/tindethuong/miniconda3/bin/python3';

        this.logger.log('Qwen Moderation Service initialized');
        this.logger.log(`Python binary: ${this.pythonBin}`);
        this.logger.log(`Model path: ${this.modelPath}`);
        this.logger.log(`Python script: ${this.pythonScriptPath}`);
    }

    async moderateContent(request: ModerationRequest): Promise<ModerationResult> {
        const startTime = Date.now();

        try {
            // Combine title and description
            const combinedText = `${request.title || ''} ${request.description || ''}`.trim();

            if (!combinedText) {
                return this.createEmptyResult();
            }

            // Check both title and description separately for better accuracy
            const titleResult = request.title
                ? await this.predictText(request.title)
                : null;

            const descriptionResult = request.description
                ? await this.predictText(request.description)
                : null;

            // Determine overall result
            const results = [titleResult, descriptionResult].filter(Boolean) as QwenPrediction[];

            if (results.length === 0) {
                return this.createEmptyResult();
            }

            // Get the worst prediction (most restrictive)
            const worstResult = this.selectWorstPrediction(results);

            const processingTime = Date.now() - startTime;

            return this.mapToModerationResult(
                worstResult,
                titleResult,
                descriptionResult,
                request,
                processingTime,
            );
        } catch (error) {
            this.logger.error(`Moderation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return this.createErrorResult(error);
        }
    }

    private selectWorstPrediction(results: QwenPrediction[]): QwenPrediction {

        return results.reduce((worst, current) => {
            if (!worst) return current;

            if (current.should_block && worst.should_block) {
                return current.confidence > worst.confidence ? current : worst;
            }

            if (current.should_block && !worst.should_block) {
                return current;
            }

            if (!current.should_block && worst.should_block) {
                return worst;
            }

            if (!current.is_safe && worst.is_safe) {
                return current;
            }

            return worst;
        });
    }

    private async predictText(text: string): Promise<QwenPrediction> {
        try {
            const escapedText = text
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/`/g, '\\`')
                .replace(/\$/g, '\\$')
                .replace(/\n/g, ' ')
                .trim();

            const command = `${this.pythonBin} "${this.pythonScriptPath}" "${escapedText}"`;

            this.logger.debug(`Running prediction for text: ${text.substring(0, 50)}...`);

            const { stdout, stderr } = await execAsync(command, {
                timeout: 30000,
                maxBuffer: 1024 * 1024,
            });

            if (stderr && !stderr.includes('✓')) {
                const isWarning = stderr.includes('Warning') ||
                    stderr.includes('deprecated') ||
                    stderr.includes('⚠');

                if (!isWarning) {
                    this.logger.warn(`Python stderr: ${stderr.substring(0, 200)}`);
                }
            }

            const result = JSON.parse(stdout) as QwenPrediction;

            this.logger.debug(
                `Prediction: ${result.prediction} ` +
                `(confidence: ${(result.confidence * 100).toFixed(1)}%, ` +
                `should_block: ${result.should_block})`
            );

            return result;

        } catch (error) {
            this.logger.error(`Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

            return {
                prediction: 'safe',
                confidence: 0,
                is_safe: true,
                should_block: false,
                inference_time_ms: 0,
            };
        }
    }

    private mapToModerationResult(
        worstResult: QwenPrediction,
        titleResult: QwenPrediction | null,
        descriptionResult: QwenPrediction | null,
        request: ModerationRequest,
        processingTime: number,
    ): ModerationResult {
        const violations: Array<{
            type: ViolationType;
            severity: number;
            reason: string;
            location: 'title' | 'description' | 'both';
            evidence?: string;
        }> = [];

        const violationTypeMap: Record<string, ViolationType> = {
            prostitution: ViolationType.ILLEGAL,
            sexual: ViolationType.SEXUAL,
            violence: ViolationType.VIOLENCE,
            hate: ViolationType.HATE,
        };

        const violationType = violationTypeMap[worstResult.prediction];

        if (worstResult.should_block && violationType) {
            let location: 'title' | 'description' | 'both' = 'both';

            if (titleResult?.should_block && !descriptionResult?.should_block) {
                location = 'title';
            } else if (!titleResult?.should_block && descriptionResult?.should_block) {
                location = 'description';
            } else if (titleResult?.should_block && descriptionResult?.should_block) {
                location = 'both';
            }

            violations.push({
                type: violationType,
                severity: Math.round(worstResult.confidence * 10), // Scale 0-10
                reason: `Detected ${worstResult.prediction} content with ${(worstResult.confidence * 100).toFixed(1)}% confidence`,
                location,
                evidence: worstResult.prediction,
            });
        }

        return {
            status: worstResult.should_block ? ModerationStatus.REJECTED : ModerationStatus.APPROVED,
            isAllowed: !worstResult.should_block,
            violations,
            confidence: worstResult.confidence,
            metadata: {
                model: 'qwen-vietnamese-content-classifier',
                processingTime,
                timestamp: new Date(),

            },
        };
    }

    private createEmptyResult(): ModerationResult {
        return {
            status: ModerationStatus.APPROVED,
            isAllowed: true,
            violations: [],
            confidence: 1.0,
            metadata: {
                model: 'qwen-vietnamese-content-classifier',
                processingTime: 0,
                timestamp: new Date(),
            },
        };
    }

    private createErrorResult(error: unknown): ModerationResult {
        this.logger.error(`Moderation error: ${error instanceof Error ? error.message : 'Unknown error'}`);

        // On error, allow content to avoid blocking legitimate posts
        return {
            status: ModerationStatus.ERROR,
            isAllowed: true,
            violations: [],
            confidence: 0,
            metadata: {
                model: 'qwen-vietnamese-content-classifier',
                processingTime: 0,
                timestamp: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        };
    }

    async checkHealth(): Promise<boolean> {
        try {
            this.logger.log('Running health check...');
            const testResult = await this.predictText('test');
            const isHealthy = testResult !== null && testResult.prediction !== undefined;

            if (isHealthy) {
                this.logger.log('✓ Health check passed');
            } else {
                this.logger.error('✗ Health check failed: invalid response');
            }

            return isHealthy;
        } catch (error) {
            this.logger.error(`✗ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }
}