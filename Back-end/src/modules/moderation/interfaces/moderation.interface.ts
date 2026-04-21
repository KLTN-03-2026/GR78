
export enum ModerationStatus {
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING',
    ERROR = 'ERROR',
}

export enum ViolationType {
    SEXUAL = 'SEXUAL',
    VIOLENCE = 'VIOLENCE',
    HATE = 'HATE',
    HARASSMENT = 'HARASSMENT',
    SELF_HARM = 'SELF_HARM',
    ILLEGAL = 'ILLEGAL',
}

export interface ModerationResult {
    status: ModerationStatus;
    isAllowed: boolean;
    violations: ViolationDetail[];
    confidence: number;
    moderatedContent?: {
        title?: string;
        description?: string;
    };
    metadata: {
        model: string;
        processingTime: number;
        timestamp: Date;
       
        error?: string;
    };
}

export interface ViolationDetail {
    type: ViolationType;
    severity: number;
    reason: string;
    location: 'title' | 'description' | 'both';
    evidence?: string
}

export interface ModerationRequest {
    title: string;
    description: string;
    userId: string;
    requestId?: string;
}

export interface OpenAIModerationResponse {
    approved: boolean;
    violations: Array<{
        type: string;
        severity: number;
        reason: string;
        location: string;
    }>;
    suggestions?: {
        title?: string;
        description?: string;
    };
}



export interface OllamaResponse {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
}

export interface ModerationAnalysis {
    approved: boolean;
    confidence: number;
    violations: Array<{
        type: string;
        severity: number;
        reason: string;
        location: string;
        evidence?: string;
    }>;
    risk_score?: number;
}
