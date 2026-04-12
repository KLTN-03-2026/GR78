import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../base-exception';

export class InternalServerException extends BaseException {
    constructor(message: string = 'Internal server error', details?: Record<string, unknown>) {
        super(
            'INTERNAL_SERVER_ERROR',
            message,
            HttpStatus.INTERNAL_SERVER_ERROR,
            process.env.NODE_ENV === 'production' ? undefined : details,
        );
    }
}

