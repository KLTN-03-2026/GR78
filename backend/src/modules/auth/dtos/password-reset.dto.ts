import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsStrongPassword,
} from 'class-validator';
import { AUTH_CONSTANTS } from '../constants/auth.constants';


export class ForgotPasswordDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email đã đăng ký tài khoản',
    })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email!: string;
}

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Raw token lấy từ link email (64-char hex string)',
        example: 'a3f1c2d4e5b6...',
    })
    @IsString({ message: 'Token must be a string' })
    @IsNotEmpty({ message: 'Token is required' })
    token!: string;

    @ApiProperty({
        example: 'NewPassword123!',
        description: 'Mật khẩu mới (min 8 ký tự, hoa, thường, số, ký tự đặc biệt)',
    })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @IsStrongPassword(
        {
            minLength: AUTH_CONSTANTS.PASSWORD_MIN_LENGTH,
            minUppercase: AUTH_CONSTANTS.PASSWORD_MIN_UPPERCASE,
            minLowercase: AUTH_CONSTANTS.PASSWORD_MIN_LOWERCASE,
            minNumbers: AUTH_CONSTANTS.PASSWORD_MIN_NUMBERS,
            minSymbols: AUTH_CONSTANTS.PASSWORD_MIN_SYMBOLS,
        },
        {
            message:
                'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
        },
    )
    newPassword!: string;
}


export class ForgotPasswordResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    
    @ApiProperty({
        example: 'If this email is registered, you will receive a reset link shortly.',
    })
    message!: string;
}

export class ResetPasswordResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Password reset successfully. Please login with your new password.' })
    message!: string;
}