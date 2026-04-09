import { UserRole } from '@/common/enums/user-role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Length,
    Matches,
    MaxDate,
    MaxLength,
    MinDate,
} from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional({
        description: 'Full legal name',
        example: 'Vo Van Tin',
        maxLength: 255
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
    @IsOptional()
    fullName?: string;

    @ApiPropertyOptional({
        description: 'Avatar URL (must be valid URL)',
        example: 'https://example.com/avatar.jpg',
        maxLength: 500
    })
    @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
    @MaxLength(500, { message: 'Avatar URL must not exceed 500 characters' })
    @IsOptional()
    avatarUrl?: string;

    @ApiPropertyOptional({
        description: 'User biography/description (min 10 chars for completion)',
        example: 'Experienced electrician with 10+ years in the industry',
        maxLength: 500
    })
    @IsString()
    @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
    @IsOptional()
    bio?: string;

    @ApiPropertyOptional({
        description: 'Physical address',
        example: '123 Nguyen Van Linh, Hai Chau, Da Nang',
        maxLength: 255
    })
    @IsString()
    @MaxLength(255, { message: 'Address must not exceed 255 characters' })
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({
        description: 'Date of birth (must be at least 13 years old)',
        example: '1990-01-15',
        type: String
    })
    @Type(() => Date)
    @IsDate({ message: 'Birthday must be a valid date' })
    @MinDate(new Date('1900-01-01'), {
        message: 'Birthday must be after January 1, 1900'
    })
    @MaxDate(
        new Date(new Date().setFullYear(new Date().getFullYear() - 13)),
        { message: 'You must be at least 13 years old' }
    )
    @IsOptional()
    birthday?: Date;

    @ApiPropertyOptional({
        description: 'Gender',
        example: 'male',
        enum: ['male', 'female', 'other']
    })
    @IsString()
    @IsEnum(['male', 'female', 'other'], {
        message: 'Gender must be one of: male, female, other'
    })
    @IsOptional()
    gender?: string;
}


export class UpdateContactDto {
    @ApiPropertyOptional({
        description: 'Email address',
        example: 'user@example.com'
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({
        description: 'Phone number (10-11 digits, Vietnam format)',
        example: '0901234567'
    })
    @IsString()
    @Matches(/^(0|\+84)[0-9]{9,10}$/, {
        message: 'Phone number must be a valid Vietnam phone number (10-11 digits)',
    })
    @IsOptional()
    phone?: string;
}


export class ChangeDisplayNameDto {
    @ApiProperty({
        description: 'New display name (can only change every 30 days)',
        example: 'Tin The Great',
        minLength: 3,
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty({ message: 'Display name is required' })
    @Length(3, 100, {
        message: 'Display name must be between 3 and 100 characters'
    })
    @Matches(/^[a-zA-Z0-9\s\u00C0-\u024F\u1E00-\u1EFF]+$/, {
        message: 'Display name can only contain letters, numbers, and spaces',
    })
    displayName!: string;
}


export class UpdateAvatarDto {
    @ApiProperty({
        description: 'Avatar URL',
        example: 'https://example.com/avatar.jpg'
    })
    @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
    @MaxLength(500, { message: 'Avatar URL must not exceed 500 characters' })
    @IsNotEmpty({ message: 'Avatar URL is required' })
    avatarUrl!: string;
}


export class SearchProfilesQueryDto {
    @ApiPropertyOptional({
        description: 'Search term for display name',
        example: 'John'
    })
    @IsString()
    @IsOptional()
    searchTerm?: string;

    @ApiPropertyOptional({
        description: 'Number of results to return',
        example: 20,
        default: 20
    })
    @Type(() => Number)
    @IsOptional()
    limit?: number = 20;

    @ApiPropertyOptional({
        description: 'Number of results to skip',
        example: 0,
        default: 0
    })
    @Type(() => Number)
    @IsOptional()
    offset?: number = 0;
}


export class DisplayNameChangeInfoDto {
    @ApiProperty({
        description: 'Whether user can change display name now',
        example: false
    })
    canChange!: boolean;

    @ApiPropertyOptional({
        description: 'Last display name change timestamp',
        example: '2024-11-13T10:00:00Z'
    })
    lastChanged?: Date;

    @ApiProperty({
        description: 'Total number of display name changes',
        example: 2
    })
    changeCount!: number;

    @ApiProperty({
        description: 'Days remaining until next change is allowed',
        example: 15
    })
    daysUntilNextChange!: number;
}


export class ProfileResponseDto {
    @ApiProperty({
        description: 'User unique identifier',
        example: 'uuid-123'
    })
    id!: string;

    @ApiPropertyOptional({
        description: 'Email address',
        example: 'user@example.com'
    })
    email?: string | null;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '0901234567'
    })
    phone?: string | null;

    @ApiProperty({
        description: 'User role',
        enum: UserRole,
        example: UserRole.CUSTOMER
    })
    role?: UserRole | null;

    @ApiPropertyOptional({
        description: 'Full legal name',
        example: 'Vo Van Tin'
    })
    fullName?: string;

    @ApiPropertyOptional({
        description: 'Public display name',
        example: 'Van Tin'
    })
    displayName?: string;

    @ApiPropertyOptional({
        description: 'Avatar image URL',
        example: 'https://cdn.example.com/avatar.jpg'
    })
    avatarUrl?: string;

    @ApiPropertyOptional({
        description: 'User biography',
        example: 'Professional electrician with 10 years experience'
    })
    bio?: string;

    @ApiPropertyOptional({
        description: 'Physical address',
        example: '123 Nguyen Van Linh, Da Nang'
    })
    address?: string;

    @ApiPropertyOptional({
        description: 'Date of birth',
        example: '1990-01-15'
    })
    birthday?: Date;

    @ApiPropertyOptional({
        description: 'Gender',
        example: 'male',
        enum: ['male', 'female', 'other']
    })
    gender?: string;

    @ApiProperty({
        description: 'Email/phone verification status',
        example: true
    })
    isVerified?: boolean;

    @ApiProperty({
        description: 'Account active status',
        example: true
    })
    isActive?: boolean | null;

    @ApiProperty({
        description: 'Display name change information and restrictions',
        type: DisplayNameChangeInfoDto
    })
    displayNameChangeInfo!: DisplayNameChangeInfoDto;

    @ApiProperty({
        description: 'Account creation timestamp',
        example: '2025-01-01T00:00:00Z'
    })
    createdAt?: Date | null;

    @ApiProperty({
        description: 'Last profile update timestamp',
        example: '2025-11-13T10:00:00Z'
    })
    updatedAt!: Date;
}


export class PublicProfileResponseDto {
    @ApiProperty({
        description: 'User unique identifier',
        example: 'uuid-123'
    })
    id!: string;

    @ApiProperty({
        description: 'User role',
        enum: UserRole,
        example: UserRole.PROVIDER
    })
    role?: UserRole;

    @ApiPropertyOptional({
        description: 'Public display name',
        example: 'Van Tin'
    })
    displayName?: string;

    @ApiPropertyOptional({
        description: 'Avatar image URL',
        example: 'https://cdn.example.com/avatar.jpg'
    })
    avatarUrl?: string;

    @ApiPropertyOptional({
        description: 'User biography',
        example: 'Professional electrician'
    })
    bio?: string;

    @ApiProperty({
        description: 'Verification badge status',
        example: true
    })
    isVerified?: boolean;

    @ApiProperty({
        description: 'Member since date',
        example: '2025-01-01T00:00:00Z'
    })
    memberSince?: Date;
}


export class MinimalProfileDto {
    @ApiProperty({
        description: 'User unique identifier',
        example: 'uuid-123'
    })
    id!: string;

    @ApiProperty({
        description: 'Display name',
        example: 'VanA'
    })
    displayName?: string;

    @ApiPropertyOptional({
        description: 'Avatar URL',
        example: 'https://cdn.example.com/avatar.jpg'
    })
    avatarUrl?: string;

    @ApiProperty({
        description: 'Verification status',
        example: true
    })
    isVerified?: boolean;
}


export class ProfileCompletionDto {
    @ApiProperty({
        description: 'Whether profile is 100% complete',
        example: false
    })
    isComplete!: boolean;

    @ApiProperty({
        description: 'Completion percentage (0-100)',
        example: 67
    })
    completionPercentage?: number;

    @ApiProperty({
        description: 'Number of completed fields',
        example: 4
    })
    completedFields?: number;

    @ApiProperty({
        description: 'Total required fields',
        example: 6
    })
    totalFields?: number;

    @ApiProperty({
        description: 'List of missing field names',
        example: ['bio', 'avatarUrl']
    })
    missingFields?: string[];
}

export class DisplayNameChangeResponseDto {
    @ApiProperty({
        description: 'Operation success status',
        example: true
    })
    success!: boolean;

    @ApiProperty({
        description: 'Response message',
        example: 'Display name changed successfully'
    })
    message!: string;

    @ApiProperty({
        description: 'New display name',
        example: 'Van Tin Pro'
    })
    newDisplayName!: string;

    @ApiProperty({
        description: 'Change timestamp',
        example: '2025-11-13T10:00:00Z'
    })
    changedAt!: Date;

    @ApiProperty({
        description: 'Days until next change allowed',
        example: 30
    })
    daysUntilNextChange!: number;
}


export class DeleteAccountResponseDto {
    @ApiProperty({
        description: 'Operation success status',
        example: true
    })
    success!: boolean;

    @ApiProperty({
        description: 'Response message',
        example: 'Account deleted successfully'
    })
    message!: string;
}


export class ProfileListResponseDto {
    @ApiProperty({
        description: 'List of profiles',
        type: [PublicProfileResponseDto]
    })
    profiles!: PublicProfileResponseDto[];

    @ApiProperty({
        description: 'Total number of profiles matching query',
        example: 100
    })
    total!: number;

    @ApiProperty({
        description: 'Number of results returned in this response',
        example: 20
    })
    count!: number;
}