import { ErrorResponseDto } from '@/common/dtos/error-response.dto';
import { BaseException } from '@/common/exceptions/base-exception';
import { LogContext, RequestWithContext } from '@/common/interfaces';
import { HttpException, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export function logError(
    logger: Logger,
    exception: Error | HttpException | BaseException | QueryFailedError,
    method: string,
    path: string,
    errorResponse: ErrorResponseDto,
    correlationId: string,
    request?: RequestWithContext,
    isProduction?: boolean,
    sensitiveRoutes: string[] = [],
): void {
    const { statusCode, code, message } = errorResponse;

    const isSensitive = sensitiveRoutes.some((route) => path.includes(route));

    const logContext: LogContext = {
        correlationId,
        method,
        path,
        statusCode,
        code,
        message,
        timestamp: errorResponse.timestamp,
    };

    if (request?.user?.id) {
        logContext.userId = request.user.id;
    }

    if (statusCode >= 500 && !isProduction) {
        logContext.errorName = exception.name;
        if (exception instanceof Error && exception.stack) {
            logContext.stack = exception.stack.split('\n').slice(0, 5).join('\n');
        }
    }

    if (statusCode >= 500) {
        logger.error(
            JSON.stringify(logContext),
            exception instanceof Error ? exception.stack : undefined,
        );
    } else if (statusCode === 401 || statusCode === 403) {
        if (isSensitive) {
            logger.warn(
                JSON.stringify({
                    correlationId,
                    method,
                    path,
                    statusCode,
                    timestamp: errorResponse.timestamp,
                }),
            );
        } else {
            logger.warn(JSON.stringify(logContext));
        }
    } else if (statusCode >= 400) {
        logger.warn(JSON.stringify(logContext));
    } else {
        logger.log(JSON.stringify(logContext));
    }
}