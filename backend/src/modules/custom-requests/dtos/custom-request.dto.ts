import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    ArrayMaxSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';
import { CustomRequestStatus } from '../enums/custom-request-status.enum';

export class CreateCustomRequestDto {
    @ApiProperty({ description: 'Target provider (craftsman) ID' })
    @IsUUID()
    providerId!: string;

    @ApiProperty({
        description: 'Request title',
        example: 'Cần thợ sửa điện nước tại nhà',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title!: string;

    @ApiProperty({
        description: 'Detailed description of the job',
        example: 'Cần sửa chữa hệ thống điện và thay vòi nước bị hỏng',
    })
    @IsString()
    @IsNotEmpty()
    description!: string;

    @ApiPropertyOptional({
        description: 'Image URLs (uploaded separately)',
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10)
    @IsOptional()
    imageUrls?: string[];

    @ApiPropertyOptional({
        description: 'Service location',
        example: 'Quận 1, TP.HCM',
    })
    @IsString()
    @MaxLength(255)
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({
        description: 'Desired completion time',
        example: '2025-11-20T10:00:00Z',
    })
    @IsDateString()
    @IsOptional()
    desiredTime?: Date;

    @ApiPropertyOptional({
        description: 'Budget in VND',
        example: 500000,
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    budget?: number;
}

export class AcceptCustomRequestDto {
    @ApiProperty({ description: 'Quoted price in VND', example: 500000 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    acceptedPrice!: number;

    @ApiProperty({ description: 'Scope of work / quote description', example: 'Kiểm tra và thay thế toàn bộ hệ thống điện khu vực phòng khách' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    quoteDescription!: string;

    @ApiPropertyOptional({ description: 'Estimated duration in minutes', example: 120 })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    estimatedDuration?: number;

    @ApiPropertyOptional({ description: 'Terms and conditions' })
    @IsString()
    @MaxLength(1000)
    @IsOptional()
    terms?: string;
}

export class RejectCustomRequestDto {
    @ApiPropertyOptional({ description: 'Reason for rejection' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}

export class GetCustomRequestsQueryDto {
    @ApiPropertyOptional({
        description: 'Filter by status',
        enum: CustomRequestStatus,
    })
    @IsEnum(CustomRequestStatus)
    @IsOptional()
    status?: CustomRequestStatus;

    @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Items per page', example: 10, minimum: 1 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit?: number = 10;
}

export class CustomRequestResponseDto {
    @ApiProperty()
    @Expose()
    id!: string;

    @ApiProperty()
    @Expose()
    customerId!: string;

    @ApiProperty()
    @Expose()
    providerId!: string;

    @ApiProperty()
    @Expose()
    title!: string;

    @ApiProperty()
    @Expose()
    description!: string;

    @ApiPropertyOptional({ type: [String] })
    @Expose()
    imageUrls?: string[];

    @ApiPropertyOptional()
    @Expose()
    location?: string;

    @ApiPropertyOptional()
    @Expose()
    @Type(() => Date)
    desiredTime?: Date;

    @ApiPropertyOptional()
    @Expose()
    budget?: number;

    @ApiProperty({ enum: CustomRequestStatus })
    @Expose()
    status!: CustomRequestStatus;

    @ApiPropertyOptional()
    @Expose()
    rejectionReason?: string;

    @ApiPropertyOptional()
    @Expose()
    @Type(() => Date)
    acceptedAt?: Date;

    @ApiPropertyOptional()
    @Expose()
    @Type(() => Date)
    rejectedAt?: Date;

    @ApiProperty()
    @Expose()
    @Type(() => Date)
    createdAt!: Date;

    @ApiProperty()
    @Expose()
    @Type(() => Date)
    updatedAt!: Date;

    @ApiPropertyOptional({
        description: 'Customer information',
        type: 'object',
    })
    @Expose()
    customer?: {
        id: string;
        fullName?: string | null;
        avatarUrl?: string | null;
        displayName?: string | null;
    };

    @ApiPropertyOptional({
        description: 'Provider information',
        type: 'object',
    })
    @Expose()
    provider?: {
        id: string;
        fullName?: string | null;
        avatarUrl?: string | null;
        displayName?: string | null;
    };
}

export class CustomRequestListResponseDto {
    @ApiProperty({ type: [CustomRequestResponseDto] })
    data!: CustomRequestResponseDto[];

    @ApiProperty()
    total!: number;

    @ApiProperty()
    page!: number;

    @ApiProperty()
    limit!: number;

    @ApiProperty()
    hasMore!: boolean;
}
