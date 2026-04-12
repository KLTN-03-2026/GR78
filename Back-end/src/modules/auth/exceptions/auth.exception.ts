import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base-exception';

export class InvalidCredentialsException extends BaseException {
    constructor(details?: Record<string, unknown>) {
        super(
            'INVALID_CREDENTIALS',
            'Invalid email or password',
            HttpStatus.UNAUTHORIZED,
            details,
        );
    }
}

export class InvalidTokenException extends BaseException {
    constructor(message: string = 'Invalid or expired token', details?: Record<string, unknown>) {
        super(
            'INVALID_TOKEN',
            message,
            HttpStatus.UNAUTHORIZED,
            details,
        );
    }
}

export class EmailAlreadyExistsException extends BaseException {
    constructor(email: string) {
        super(
            'EMAIL_ALREADY_EXISTS',
            `Email ${email} is already registered`,
            HttpStatus.CONFLICT,
            { email },
        );
    }
}

export class PhoneAlreadyExistsException extends BaseException {
    constructor(phone: string) {
        super(
            'PHONE_ALREADY_EXISTS',
            `Phone number ${phone} is already registered`,
            HttpStatus.CONFLICT,
            { phone },
        );
    }
}

export class AccountNotActivatedException extends BaseException {
    constructor(userId: string) {
        super(
            'ACCOUNT_NOT_ACTIVATED',
            'Your account is not activated. Please check your email.',
            HttpStatus.FORBIDDEN,
            { userId },
        );
    }
}

export class AccountLockedException extends BaseException {
    constructor(userId: string, reason?: string) {
        super(
            'ACCOUNT_LOCKED',
            reason || 'Your account has been locked. Please contact support.',
            HttpStatus.FORBIDDEN,
            { userId, reason },
        );
    }
}