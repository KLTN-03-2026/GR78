import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsString,
    Length,
    Matches,
    MinLength,
} from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty({ description: 'Email address to verify', example: 'user@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ description: '6-digit OTP code', example: '123456' })
    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
    otp!: string;
}

export class ResendVerificationDto {
    @ApiProperty({ description: 'Email address to resend OTP to', example: 'user@example.com' })
    @IsEmail()
    email!: string;
}

export class ForgotPasswordOtpDto {
    @ApiProperty({ description: 'Email address to send OTP to', example: 'user@example.com' })
    @IsEmail()
    email!: string;
}

export class ResetPasswordOtpDto {
    @ApiProperty({ description: 'Email address', example: 'user@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ description: '6-digit OTP code from email', example: '123456' })
    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
    otp!: string;

    @ApiProperty({ description: 'New password (min 8 characters)', example: 'NewPassword123!' })
    @IsString()
    @MinLength(8)
    newPassword!: string;
}

export class OtpSuccessResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'If this email is registered, an OTP has been sent.' })
    message!: string;
}
