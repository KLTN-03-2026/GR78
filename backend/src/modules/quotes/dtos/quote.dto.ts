import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    MaxLength,
    Min,
    IsPositive
} from 'class-validator';
import { QuoteStatus } from '../enums/quote-status.enum';

export class CreateQuoteDto {
    @ApiPropertyOptional({
        description: 'ID of the public post to quote on (provide either postId or customRequestId)',
    })
    @IsOptional()
    @IsUUID()
    postId?: string;

    @ApiPropertyOptional({
        description: 'ID of the custom request to quote on (provide either postId or customRequestId)',
    })
    @IsOptional()
    @IsUUID()
    customRequestId?: string;

    @ApiProperty({ description: 'the price of a quote ', example: 500000 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price!: number;

    @ApiProperty({ description: 'Detailed description quote' })
    @IsString()
    @MaxLength(2000)
    description!: string;

    @ApiPropertyOptional({ description: 'Terms and conditions' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    terms?: string;

    @ApiPropertyOptional({ description: 'Estimated time (minutes)', example: 120 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    estimatedDuration?: number;

    @ApiPropertyOptional({ description: 'List of image URLs' })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    imageUrls?: string[];
}

export class UpdateQuoteDto {
    @ApiPropertyOptional({ description: 'New offer price' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price?: number;

    @ApiPropertyOptional({ description: 'New description' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({ description: 'New Terms' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    terms?: string;

    @ApiPropertyOptional({ description: 'New estimated time' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    estimatedDuration?: number;

    @ApiPropertyOptional({ description: 'New image' })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    imageUrls?: string[];
}

export class AcceptQuoteDto {
}

export class RejectQuoteDto {
    @ApiPropertyOptional({ description: 'Reason for refusal' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}



export class StatusQuoteDto {
    @ApiPropertyOptional({
        description: 'Post status',
        enum: QuoteStatus,
        example: QuoteStatus.CANCELLED,
    })
    @IsOptional()
    @IsEnum(QuoteStatus)
    status?: QuoteStatus;
}


export class QuoteResponseDto {
    @ApiProperty({ description: 'ID quote' })
    @Expose()
    id!: string;

    @ApiPropertyOptional({ description: 'ID post' })
    @Expose()
    postId?: string;

    @ApiPropertyOptional({ description: 'ID custom request' })
    @Expose()
    customRequestId?: string;

    @ApiProperty({ description: 'ID provider' })
    @Expose()
    providerId?: string;

    @ApiProperty({ description: 'price quote', example: 500000 })
    @Expose()
    price?: number;

    @ApiPropertyOptional({ description: 'Detailed description' })
    @Expose()
    description?: string;

    @ApiPropertyOptional({ description: 'terms' })
    @Expose()
    terms?: string;

    @ApiPropertyOptional({ description: 'Estimated time (hours)', example: 4 })
    @Expose()
    estimatedDuration?: number;

    @ApiPropertyOptional({
        description: 'List of image URLs',
        type: [String],
    })
    @Expose()
    imageUrls?: string[];

    @ApiProperty({
        description: 'status quote',
        enum: QuoteStatus,
        example: QuoteStatus.PENDING,
    })
    @Expose()
    status?: QuoteStatus;

    @ApiPropertyOptional({ description: 'Acceptance time' })
    @Expose()
    @Type(() => Date)
    acceptedAt?: Date;

    @ApiPropertyOptional({ description: 'Time of rejection' })
    @Expose()
    @Type(() => Date)
    rejectedAt?: Date;

    @ApiPropertyOptional({ description: 'Reason for refusal' })
    @Expose()
    rejectionReason?: string;

    @ApiPropertyOptional({ description: 'time cancel' })
    @Expose()
    @Type(() => Date)
    cancelledAt?: Date;

    @ApiPropertyOptional({ description: 'Reason for cancellation' })
    @Expose()
    cancellationReason?: string;

    @ApiProperty({ description: 'creation time' })
    @Expose()
    @Type(() => Date)
    createdAt?: Date;

    @ApiProperty({ description: 'Update time' })
    @Expose()
    @Type(() => Date)
    updatedAt?: Date;

}




export class CreateQuoteToCustomerDto {
    @ApiProperty({ description: 'ID post' })
    @IsUUID()
    providerId!: string;

    @ApiProperty({ description: 'the price of a quote ', example: 500000 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price!: number;

    @ApiProperty({ description: 'Detailed description quote' })
    @IsString()
    @MaxLength(2000)
    description!: string;

    @ApiPropertyOptional({ description: 'Terms and conditions' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    terms?: string;

    @ApiPropertyOptional({ description: 'Estimated time (minutes)', example: 120 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    estimatedDuration?: number;

    @ApiPropertyOptional({ description: 'List of image URLs' })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    imageUrls?: string[];
}



export class ReviseQuoteDto {
    @ApiProperty({ description: 'Giá mới' })
    @IsNumber()
    @IsPositive()
    price!: number;

    @ApiPropertyOptional({ description: 'Mô tả cập nhật (nếu có)' })
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    terms?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Min(1)
    estimatedDuration?: number;

    @ApiPropertyOptional({ description: 'Lý do thay đổi giá' })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    changeReason?: string;
}


export class CancelQuoteDto {
    @ApiPropertyOptional({ description: 'Lý do hủy' })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    reason?: string;
}

export class QuoteRevisionItemDto {
    @ApiProperty({ description: 'Revision ID' })
    id!: string;

    @ApiProperty({ description: 'Revision number — 1 is the original quote, higher numbers are re-quotes' })
    revisionNumber!: number;

    @ApiProperty({ description: 'Offered price in VND' })
    price!: number;

    @ApiProperty()
    description!: string;

    @ApiPropertyOptional()
    terms?: string;

    @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
    estimatedDuration?: number;

    @ApiProperty({ type: [String] })
    imageUrls!: string[];

    @ApiPropertyOptional({ description: "Provider's stated reason for changing the price" })
    changeReason?: string;

    @ApiPropertyOptional({ description: 'Price delta vs previous revision (VND); null for the first revision' })
    priceChange?: number;

    @ApiPropertyOptional({ description: 'Percentage change vs previous revision; null for the first revision' })
    percentChange?: number;

    @ApiPropertyOptional({ description: 'Order ID this revision was committed to, if any' })
    usedForOrderId?: string;

    @ApiProperty()
    createdAt!: Date;
}

export class QuoteWithRevisionsResponseDto {
    @ApiProperty({ description: 'Quote ID' })
    id!: string;

    @ApiProperty({ enum: QuoteStatus })
    status!: QuoteStatus;

    @ApiProperty({ description: 'Current offered price in VND' })
    currentPrice!: number;

    @ApiProperty({ description: 'Total number of price revisions (1 = only the original quote)' })
    revisionCount!: number;

    @ApiPropertyOptional({ description: 'ID of the related public post' })
    postId?: string;

    @ApiPropertyOptional({ description: 'ID of the related custom request' })
    customRequestId?: string;

    @ApiProperty({ description: 'Provider (technician) user ID' })
    providerId!: string;

    @ApiPropertyOptional({ description: 'Timestamp when the customer opened the chat' })
    chatOpenedAt?: Date;

    @ApiPropertyOptional({ description: 'Timestamp when the customer requested an order' })
    orderRequestedAt?: Date;

    @ApiProperty({ type: [QuoteRevisionItemDto], description: 'Full revision history, oldest first' })
    revisions!: QuoteRevisionItemDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

