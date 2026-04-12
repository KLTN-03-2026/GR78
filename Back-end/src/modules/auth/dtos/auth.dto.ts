import { UserRole } from '@/common/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsEnum, IsNotEmpty, IsString, IsStrongPassword,
    Matches,
    MaxLength,
    MinLength
} from 'class-validator';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
export class LoginMobileDto {
    @ApiProperty({ description: 'Email or phone' })
    @IsString()
    identifier!: string;

    @ApiProperty()
    @IsString()
    password!: string;
}


export class LoginDto {
    @ApiProperty({ description: 'Email or phone' })
    @IsString()
    identifier!: string;

    @ApiProperty()
    @IsString()
    password!: string;
}


export class RefreshTokenDto {
    @ApiProperty({
        description: 'Refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    @IsNotEmpty()
    refreshToken!: string;
}



export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;

    @ApiProperty({
        example: '+84901234567',
        description: 'Phone number with country code',
    })
    @IsString({ message: 'Phone must be a string' })
    @IsNotEmpty({ message: 'Phone is required' })

    @Matches(/^0\d{9}$/, {
        message: 'Invalid phone number format',
    })

    @Transform(({ value }) => value?.trim())
    phone?: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'Full name of the user',
    })
    @IsString({ message: 'Full name must be a string' })
    @IsNotEmpty({ message: 'Full name is required' })
    @MinLength(2, { message: 'Full name must be at least 2 characters' })
    @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
    @Transform(({ value }) => value?.trim())
    fullName?: string;

    @ApiProperty({
        example: 'Password123!',
        description: 'Strong password (min 8 chars, uppercase, lowercase, number, symbol)',
    })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @IsStrongPassword({
        minLength: AUTH_CONSTANTS.PASSWORD_MIN_LENGTH,
        minUppercase: AUTH_CONSTANTS.PASSWORD_MIN_UPPERCASE,
        minLowercase: AUTH_CONSTANTS.PASSWORD_MIN_LOWERCASE,
        minNumbers: AUTH_CONSTANTS.PASSWORD_MIN_NUMBERS,
        minSymbols: AUTH_CONSTANTS.PASSWORD_MIN_SYMBOLS,
    }, {
        message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
    })
    password?: string;


    @ApiProperty({
        example: UserRole.CUSTOMER,
        description: 'User role - customer or provider',
        enum: UserRole,
        enumName: 'UserRole',
    })
    @IsEnum(UserRole, {
        message: `Role must be either ${UserRole.CUSTOMER} or ${UserRole.PROVIDER}`
    })
    @IsNotEmpty({ message: 'Role is required' })
    role!: UserRole;

}