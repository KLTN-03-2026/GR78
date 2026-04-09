import { ErrorResponseDto } from '@/common/dtos/error-response.dto';
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';
import { HttpExceptionResponse, RequestWithContext } from '../../interfaces/index';
import { BaseException } from '../base-exception';
import {
    extractCode,
    extractDetails,
    extractMessage,
    handleDatabaseError,
    logError,
} from './index';


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);
    private readonly isProduction = process.env.NODE_ENV === 'production';
    private readonly sensitiveRoutes = ['/auth/login', '/auth/register', '/auth/refresh'];

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: Error | HttpException | BaseException | QueryFailedError, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<RequestWithContext>();
        const response = ctx.getResponse();

        const path = request?.url ?? 'unknown';
        const method = request?.method ?? 'unknown';
        const timestamp = new Date().toISOString();

        const correlationId = request?.correlationId || 'unknown';

        const errorResponse = this.buildErrorResponse(exception, path, timestamp);

        logError(this.logger, exception, method, path, errorResponse, correlationId, request);

        httpAdapter.reply(response, errorResponse, errorResponse.statusCode);
    }

    
    private buildErrorResponse(
        exception: Error | HttpException | BaseException | QueryFailedError,
        path: string,
        timestamp: string,
    ): ErrorResponseDto {
        if (this.isBaseException(exception)) {
            return {
                success: false,
                statusCode: exception.statusCode,
                code: exception.code,
                message: exception.message,
                details: exception.details,
                path,
                timestamp,
            };
        }

        if (this.isQueryFailedError(exception)) {
            return handleDatabaseError(exception, path, timestamp);
        }

        if (this.isHttpException(exception)) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse() as unknown as HttpExceptionResponse;
            return {
                success: false,
                statusCode: status,
                code: extractCode(exceptionResponse, status),
                message: extractMessage(exceptionResponse, exception),
                details: extractDetails(exceptionResponse),
                path,
                timestamp,
            };
        }

        return {
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            code: 'INTERNAL_SERVER_ERROR',
            message: this.isProduction
                ? 'An unexpected error occurred'
                : exception.message,
            details: this.isProduction
                ? undefined
                : {
                    name: exception.name,
                    stack: exception.stack?.split('\n').slice(0, 5).join('\n'),
                },
            path,
            timestamp,
        };
    }

    /**
     * Type guard for BaseException
     *
     */
    private isBaseException(exception: Error | HttpException | BaseException | QueryFailedError): exception is BaseException {
        return exception instanceof BaseException;
    }

    /**
     * Type guard for QueryFailedError
     *
     */
    private isQueryFailedError(exception: Error | HttpException | BaseException | QueryFailedError): exception is QueryFailedError {
        return exception instanceof QueryFailedError;
    }

    /**
     * Type guard for HttpException
     * 
     */
    private isHttpException(exception: Error | HttpException | BaseException | QueryFailedError): exception is HttpException {
        return exception instanceof HttpException;
    }

}