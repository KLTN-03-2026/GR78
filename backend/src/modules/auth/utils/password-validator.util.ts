import { BadRequestException } from '@nestjs/common';

export class PasswordValidatorUtil {
    private static readonly MIN_LENGTH = 8;
    private static readonly UPPERCASE_REGEX = /[A-Z]/;
    private static readonly LOWERCASE_REGEX = /[a-z]/;
    private static readonly NUMBER_REGEX = /[0-9]/;
    private static readonly SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

    static validate(password: string): void {
        if (password.length < this.MIN_LENGTH) {
            throw new BadRequestException({
                code: 'WEAK_PASSWORD',
                message: `Password must be at least ${this.MIN_LENGTH} characters long`,
            });
        }

        const hasUpperCase = this.UPPERCASE_REGEX.test(password);
        const hasLowerCase = this.LOWERCASE_REGEX.test(password);
        const hasNumber = this.NUMBER_REGEX.test(password);
        const hasSpecialChar = this.SPECIAL_CHAR_REGEX.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
            throw new BadRequestException({
                code: 'WEAK_PASSWORD',
                message:
                    'Password must contain uppercase, lowercase, number, and special character',
            });
        }
    }
}