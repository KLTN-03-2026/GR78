export interface LogContext {
    correlationId: string;
    method: string;
    path: string;
    statusCode: number;
    code: string;
    message: string;
    timestamp: string;
    userId?: string;
    errorName?: string;
    stack?: string;
}