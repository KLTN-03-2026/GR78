import { BadRequestException, NotFoundException } from '@nestjs/common';


export class InvalidResetTokenException extends BadRequestException {
    constructor() {
        super({
            code: 'INVALID_RESET_TOKEN',
            message: 'Reset token is invalid or has expired',
        });
    }
}


export class SamePasswordException extends BadRequestException {
    constructor() {
        super({
            code: 'SAME_PASSWORD',
            message: 'New password must be different from the current password',
        });
    }
}


export class UserForResetNotFoundException extends NotFoundException {
    constructor(email: string) {
        super({
            code: 'USER_NOT_FOUND_FOR_RESET',
            message: `User with email ${email} not found`,
        });
    }
}