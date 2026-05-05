import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
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
    MaxLength,
    Min,
} from 'class-validator';
import { PostStatus } from '../enums/post-status.enum';

export class CreatePostDto {
    @ApiProperty({
        description: 'Post title',
        example: 'Cần thợ sửa điện nước tại nhà'
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title!: string;

    @ApiProperty({
        description: 'Detailed description',
        example: 'Cần sửa chữa hệ thống điện và thay vòi nước bị hỏng'
    })
    @IsString()
    @IsNotEmpty()
    description!: string;

    @ApiPropertyOptional({
        description: 'Image URLs',
        type: [String],
        example: ['https://cohangxomdamdang/image1.jpg']
    })
    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(10)
    @IsOptional()
    imageUrls?: string[];

    @ApiPropertyOptional({
        description: 'Service location',
        example: 'Quận 1, TP.HCM'
    })
    @IsString()
    @MaxLength(255)
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({
        description: 'Desired completion time',
        example: '2025-11-20T10:00:00Z'
    })
    @IsDateString()
    @IsOptional()
    desiredTime?: Date;

    @ApiPropertyOptional({
        description: 'Budget in VND',
        example: 500000
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    budget?: number;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @ApiPropertyOptional({
        description: 'Post status',
        enum: PostStatus,
        example: PostStatus.OPEN
    })
    @IsEnum(PostStatus)
    @IsOptional()
    status?: PostStatus;
}

export class GetFeedQueryDto {
    @ApiPropertyOptional({
        description: 'Number of posts per page',
        example: 10,
        minimum: 1,
        maximum: 50
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Cursor for pagination (ISO date)',
        example: '2025-11-13T10:00:00.000Z'
    })
    @IsString()
    @IsOptional()
    cursor?: string;
}

export class PostResponseDto {
    @ApiProperty({ example: 'uuid-123' })
    id!: string;

    @ApiProperty({ example: 'Cần thợ sửa điện nước' })
    title!: string;

    @ApiProperty({ example: 'Mô tả chi tiết...' })
    description!: string;

    @ApiPropertyOptional({ type: [String] })
    imageUrls?: string[];

    @ApiPropertyOptional({ example: 'Quận 1, TP.HCM' })
    location?: string;

    @ApiPropertyOptional({ example: '2025-11-20T10:00:00Z' })
    desiredTime?: Date;

    @ApiPropertyOptional({ example: 500000 })
    budget?: number;

    @ApiProperty({ enum: PostStatus, example: PostStatus.OPEN })
    status!: PostStatus;


    @ApiProperty({
        description: 'Customer information',
        type: 'object',
        properties: {
            customerId: { type: 'string' },
            fullName: { type: 'string' },
            avatarUrl: { type: 'string' },
        }
    })
    @Expose()
    customer!: {
        customerId: string;
        fullName?: string | null;
        avatarUrl?: string | null;
        displayName?: string | null
    };

    @ApiProperty({ example: '2025-11-13T10:00:00Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2025-11-13T10:00:00Z' })
    updatedAt!: Date;
}

export class FeedResponseDto {
    @ApiProperty({ type: [PostResponseDto] })
    data!: PostResponseDto[];

    @ApiPropertyOptional({
        description: 'Next cursor for pagination',
        example: '2025-11-13T09:00:00.000Z'
    })
    nextCursor?: string | null;

    @ApiProperty({ example: 10 })
    total!: number;

    @ApiProperty({ example: true })
    hasMore!: boolean;
}

export class DeletePostResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Post deleted successfully' })
    message!: string;

    @ApiProperty({ example: 'uuid-123' })
    postId!: string;
}