import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base-exception';

export class InvalidOtpException extends BaseException {
    constructor() {
        super(
            'INVALID_OTP',
            'Invalid or expired OTP code',
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class OtpCooldownException extends BaseException {
    constructor(cooldownSeconds: number) {
        super(
            'OTP_COOLDOWN',
            `Please wait ${cooldownSeconds} seconds before requesting another OTP`,
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }
}

export class OtpMaxAttemptsException extends BaseException {
    constructor() {
        super(
            'OTP_MAX_ATTEMPTS',
            'Too many incorrect attempts. Please request a new OTP.',
            HttpStatus.BAD_REQUEST,
        );
    }
}
