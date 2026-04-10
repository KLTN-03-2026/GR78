import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../base-exception';

export class ValidationException extends BaseException {
    constructor(field: string, message: string, details?: Record<string, unknown>) {
        super(
            'VALIDATION_ERROR',
            message,
            HttpStatus.BAD_REQUEST,
            { field, ...details },
        );
    }
}

export class InvalidInputException extends BaseException {
    constructor(message: string, details?: Record<string, unknown>) {
        super(
            'INVALID_INPUT',
            message,
            HttpStatus.BAD_REQUEST,
            details,
        );
    }
}
