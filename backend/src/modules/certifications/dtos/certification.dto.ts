import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { CertificationStatus } from '../enums/certification-status.enum';

export class UploadCertificationDto {
    @ApiProperty({
        description: 'Certificate title',
        example: 'Chứng chỉ hành nghề điện hạng A',
        maxLength: 200,
    })
    @IsString()
    @IsNotEmpty({ message: 'Certificate title is required' })
    @MaxLength(200)
    title!: string;

    @ApiPropertyOptional({
        description: 'Name of the issuing authority',
        example: 'Sở Xây Dựng TP.HCM',
        maxLength: 200,
    })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    issuingOrganization?: string;

    @ApiPropertyOptional({
        description: 'Date the certificate was issued (ISO 8601, e.g. 2022-03-15)',
        example: '2022-03-15',
    })
    @IsDateString({}, { message: 'Issue date must be a valid date string (YYYY-MM-DD)' })
    @IsOptional()
    issueDate?: string;

    @ApiPropertyOptional({
        description: 'Expiry date (ISO 8601). Omit for non-expiring certificates',
        example: '2027-03-15',
    })
    @IsDateString({}, { message: 'Expiry date must be a valid date string (YYYY-MM-DD)' })
    @IsOptional()
    expiryDate?: string;
}

export class CertificationResponseDto {
    @ApiProperty({ example: 'uuid-123' })
    id!: string;

    @ApiProperty({ example: 'uuid-456' })
    userId!: string;

    @ApiProperty({ example: 'Chứng chỉ hành nghề điện hạng A' })
    title!: string;

    @ApiPropertyOptional({ example: 'Sở Xây Dựng TP.HCM' })
    issuingOrganization?: string;

    @ApiPropertyOptional({ example: '2022-03-15' })
    issueDate?: Date;

    @ApiPropertyOptional({ example: '2027-03-15' })
    expiryDate?: Date;

    @ApiProperty({ description: 'Public URL to the PDF file' })
    fileUrl!: string;

    @ApiPropertyOptional({ description: 'Original filename uploaded by the provider' })
    originalName?: string;

    @ApiPropertyOptional({ description: 'File size in bytes', example: 204800 })
    fileSize?: number;

    @ApiProperty({
        enum: CertificationStatus,
        description: 'pending → awaiting admin review; verified → approved; rejected → declined',
        example: CertificationStatus.PENDING,
    })
    verificationStatus!: CertificationStatus;

    @ApiPropertyOptional({ description: 'Reason provided when status is rejected' })
    rejectionReason?: string;

    @ApiProperty({ description: 'True when expiryDate is in the past', example: false })
    isExpired!: boolean;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class CertificationListResponseDto {
    @ApiProperty({ type: [CertificationResponseDto] })
    data!: CertificationResponseDto[];

    @ApiProperty({ example: 2 })
    total!: number;
}

export class PublicCertificationDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ example: 'Chứng chỉ hành nghề điện hạng A' })
    title!: string;

    @ApiPropertyOptional({ example: 'Sở Xây Dựng TP.HCM' })
    issuingOrganization?: string;

    @ApiPropertyOptional()
    issueDate?: Date;

    @ApiPropertyOptional()
    expiryDate?: Date;

    @ApiProperty({ description: 'Public URL to the PDF file' })
    fileUrl!: string;

    @ApiProperty({ description: 'True when expiryDate is in the past', example: false })
    isExpired!: boolean;

    @ApiProperty()
    createdAt!: Date;
}

export class PublicCertificationListResponseDto {
    @ApiProperty({ type: [PublicCertificationDto] })
    data!: PublicCertificationDto[];

    @ApiProperty({ example: 3 })
    total!: number;
}
