import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../base-exception';

export class BusinessRuleViolationException extends BaseException {
    constructor(rule: string, message: string, details?: Record<string, unknown>) {
        super(
            'BUSINESS_RULE_VIOLATION',
            message,
            HttpStatus.BAD_REQUEST,
            { rule, ...details },
        );
    }
}

export class InsufficientPermissionsException extends BaseException {
    constructor(action: string, resource: string) {
        super(
            'INSUFFICIENT_PERMISSIONS',
            `You do not have permission to ${action} ${resource}`,
            HttpStatus.FORBIDDEN,
            { action, resource },
        );
    }
}
