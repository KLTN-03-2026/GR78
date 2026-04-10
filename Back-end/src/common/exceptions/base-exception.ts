import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class BaseException extends HttpException {
    constructor(
        public readonly code: string,
        public readonly message: string,
        public readonly statusCode: HttpStatus,
        public readonly details?: Record<string, unknown>,
    ) {
        super({ code, message, details }, statusCode);
    }
}