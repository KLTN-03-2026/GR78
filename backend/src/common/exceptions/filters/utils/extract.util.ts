import { HttpExceptionResponse } from '@/common/interfaces';
import { HttpException, HttpStatus } from '@nestjs/common';
import { flattenValidationErrors } from './validation.util';
export function extractCode(response: string | HttpExceptionResponse, status: number): string {
    if (typeof response === 'object' && response !== null) {
        if (response.code) {
            return response.code;
        }
        if (response.error) {
            return response.error;
        }
    }

    return HttpStatus[status] ?? `HTTP_${status}`;
}


export function extractMessage(response: string | HttpExceptionResponse, exception: HttpException): string {
    if (typeof response === 'string') {
        return response;
    }

    if (typeof response === 'object' && response !== null) {
        const message = response.message;

        if (Array.isArray(message)) {
            return message.join(', ');
        }

        if (typeof message === 'string') {
            return message;
        }

        if (typeof message === 'object' && message !== null) {
            const messages = flattenValidationErrors(message);
            return messages.join(', ');
        }
    }

    return exception.message || 'An error occurred';
}


export function extractDetails(response: string | HttpExceptionResponse): Record<string, unknown> | undefined {
    if (typeof response === 'object' && response !== null) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { message, code, error, statusCode, ...details } = response;

        return Object.keys(details).length > 0 ? details : undefined;
    }

    return undefined;
}