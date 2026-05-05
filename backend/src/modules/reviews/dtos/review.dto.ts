import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ description: 'ID of the completed order to review' })
    @IsUUID()
    orderId!: string;

    @ApiProperty({ description: 'Rating from 1 (worst) to 5 (best)', minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number;

    @ApiPropertyOptional({ description: 'Optional review comment', maxLength: 1000 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    @IsOptional()
    comment?: string;

    @ApiPropertyOptional({ description: 'Whether the review is public (default: true)', default: true })
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
}

export class AddReplyDto {
    @ApiProperty({ description: 'Provider reply to the review', maxLength: 1000 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    reply!: string;
}

export class ReviewerInfoDto {
    @ApiProperty()
    @Expose()
    id!: string;

    @ApiPropertyOptional()
    @Expose()
    fullName?: string | null;

    @ApiPropertyOptional()
    @Expose()
    displayName?: string | null;

    @ApiPropertyOptional()
    @Expose()
    avatarUrl?: string | null;
}

export class ReviewResponseDto {
    @ApiProperty()
    @Expose()
    id!: string;

    @ApiProperty()
    @Expose()
    orderId!: string;

    @ApiProperty()
    @Expose()
    reviewerId!: string;

    @ApiProperty()
    @Expose()
    revieweeId!: string;

    @ApiProperty({ minimum: 1, maximum: 5 })
    @Expose()
    rating!: number;

    @ApiPropertyOptional()
    @Expose()
    comment?: string;

    @ApiProperty()
    @Expose()
    isPublic!: boolean;

    @ApiPropertyOptional()
    @Expose()
    providerReply?: string;

    @ApiPropertyOptional()
    @Expose()
    @Type(() => Date)
    repliedAt?: Date;

    @ApiProperty()
    @Expose()
    @Type(() => Date)
    createdAt!: Date;

    @ApiProperty()
    @Expose()
    @Type(() => Date)
    updatedAt!: Date;

    @ApiPropertyOptional({ type: () => ReviewerInfoDto })
    @Expose()
    reviewer?: ReviewerInfoDto;

    @ApiPropertyOptional({ type: () => ReviewerInfoDto })
    @Expose()
    reviewee?: ReviewerInfoDto;
}

export class ReviewListResponseDto {
    @ApiProperty({ type: [ReviewResponseDto] })
    data!: ReviewResponseDto[];

    @ApiProperty()
    total!: number;

    @ApiProperty()
    page!: number;

    @ApiProperty()
    limit!: number;

    @ApiProperty()
    hasMore!: boolean;

    @ApiPropertyOptional({ description: 'Average rating across all results' })
    averageRating?: number;
}

export class GetReviewsQueryDto {
    @ApiPropertyOptional({ minimum: 1, default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    limit?: number = 10;
}
