import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggingContext} from '@/common/interfaces';


@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
    private readonly sensitiveRoutes = ['/auth/login', '/auth/register', '/auth/refresh'];

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const startTime = Date.now();

        const logContext: LoggingContext = {
            correlationId: request.correlationId || 'unknown',
            method: request.method,
            path: request.url,
            clientIp: this.extractClientIp(request),
            userAgent: request.headers['user-agent'] || 'unknown',
        };

        if (request.user) {
            logContext.userId = request.user.id;
        }

        if (request.headers['x-device-id']) {
            logContext.deviceId = request.headers['x-device-id'];
        }

        return next.handle().pipe(
            tap(() => {
                logContext.duration = Date.now() - startTime;
                logContext.statusCode = response.statusCode;

                this.logRequest(logContext, 'SUCCESS');
            }),
            catchError((error) => {
                logContext.duration = Date.now() - startTime;
                logContext.statusCode = error.status || 500;
                logContext.error = error.message;

                this.logRequest(logContext, 'ERROR');
                throw error;
            }),
        );
    }

    private logRequest(context: LoggingContext, type: 'SUCCESS' | 'ERROR'): void {
        const isSensitive = this.sensitiveRoutes.some(route =>
            context.path.includes(route)
        );

        const sanitizedContext = isSensitive
            ? {
                correlationId: context.correlationId,
                method: context.method,
                path: context.path,
                statusCode: context.statusCode,
                duration: context.duration,
            }
            : context;

        const message = `${context.method} ${context.path} - ${context.statusCode} (${context.duration}ms)`;

        if (type === 'ERROR') {
            this.logger.error(message, JSON.stringify(sanitizedContext));
        } else if (context.statusCode && context.statusCode >= 400) {
            this.logger.warn(message, JSON.stringify(sanitizedContext));
        } else {
            this.logger.log(message, JSON.stringify(sanitizedContext));
        }
    }

    private extractClientIp(request: any): string {
        return (
            request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            request.headers['x-real-ip'] ||
            request.socket.remoteAddress ||
            'unknown'
        );
    }
}