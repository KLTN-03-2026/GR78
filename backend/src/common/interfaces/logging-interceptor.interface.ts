export interface LoggingContext {
    correlationId: string;
    method: string;
    path: string;
    clientIp: string;
    userAgent: string;
    userId?: string;
    deviceId?: string;
    duration?: number;
    statusCode?: number;
    error?: string;
}