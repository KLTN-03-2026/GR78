import { ErrorResponseDto } from '@/common/dtos/error-response.dto';
import { PostgresError } from '@/common/interfaces';
import { HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
export function handleDatabaseError(
    error: QueryFailedError,
    path: string,
    timestamp: string,
    isProduction = false,
): ErrorResponseDto {
    const isPostgresError = (error: QueryFailedError): error is QueryFailedError & PostgresError => {
        return 'code' in error && typeof (error as PostgresError).code === 'string';
    }
    if (!isPostgresError(error)) {
        return {
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            code: 'DATABASE_ERROR',
            message: isProduction
                ? 'A database error occurred'
                : error.message,
            path,
            timestamp,
        };
    }

    const pgError = error as QueryFailedError & PostgresError;

    switch (pgError.code) {
        case '23505': 
            return {
                success: false,
                statusCode: HttpStatus.CONFLICT,
                code: 'DUPLICATE_ENTRY',
                message: 'A record with this value already exists',
                details: isProduction
                    ? undefined
                    : {
                        constraint: pgError.constraint,
                        detail: pgError.detail,
                    },
                path,
                timestamp,
            };

        case '23503': 
            return {
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                code: 'FOREIGN_KEY_VIOLATION',
                message: 'Referenced record does not exist',
                details: isProduction
                    ? undefined
                    : {
                        constraint: pgError.constraint,
                    },
                path,
                timestamp,
            };

        case '23502': 
            return {
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                code: 'MISSING_REQUIRED_FIELD',
                message: 'Required field is missing',
                details: isProduction
                    ? undefined
                    : {
                        column: pgError.column,
                    },
                path,
                timestamp,
            };

        case '22P02': 
            return {
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                code: 'INVALID_DATA_FORMAT',
                message: 'Invalid data format',
                path,
                timestamp,
            };

        default:
            return {
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                code: 'DATABASE_ERROR',
                message: isProduction
                    ? 'A database error occurred'
                    : error.message,
                details: isProduction
                    ? undefined
                    : {
                        code: pgError.code,
                        detail: pgError.detail,
                    },
                path,
                timestamp,
            };
    }
}
