import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../base-exception';

export class RateLimitExceededException extends BaseException {
    constructor(limit: number, windowMs: number) {
        super(
            'RATE_LIMIT_EXCEEDED',
            `Too many requests. Please try again in ${Math.ceil(windowMs / 1000)} seconds.`,
            HttpStatus.TOO_MANY_REQUESTS,
            { limit, windowMs },
        );
    }
}