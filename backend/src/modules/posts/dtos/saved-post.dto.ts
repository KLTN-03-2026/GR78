import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsDateString,
    IsNumber,
    IsOptional,
    IsUUID,
    Min,
} from 'class-validator';

export class SavePostDto {
    @ApiProperty({
        description: 'Post ID to save',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    postId!: string;
}

export class SavedPostResponseDto {
    @Expose()
    @ApiProperty({
        description: 'Saved post ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id!: string;

    @Expose()
    @ApiProperty({
        description: 'Provider ID',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    providerId!: string;

    @Expose()
    @ApiProperty({
        description: 'Post ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    postId!: string;

    @Expose()
    @Type(() => Date)
    @ApiProperty({
        description: 'Timestamp when post was saved',
        example: '2025-11-13T10:00:00.000Z',
    })
    createdAt!: Date;

    @Expose()
    @ApiPropertyOptional({
        description: 'Post details (if eager loaded)',
    })
    post?: {
        id: string;
        title: string;
        description: string;
        imageUrls: string[];
        location: string;
        budget: number;
        status: string;
        createdAt: Date;
        customer?: {
            id: string;
            profile?: {
                fullName: string;
                avatar?: string;
            };
        };
    };
}

export class GetSavedPostsQueryDto {
    @ApiPropertyOptional({
        description: 'Number of saved posts per page',
        example: 10,
        minimum: 1,
        maximum: 50,
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Cursor for pagination (ISO date)',
        example: '2025-11-13T10:00:00.000Z',
    })
    @IsDateString()
    @IsOptional()
    cursor?: string;
}

export class SavedPostsListResponseDto {
    @Expose()
    @Type(() => SavedPostResponseDto)
    @ApiProperty({
        type: [SavedPostResponseDto],
        description: 'List of saved posts',
    })
    data!: SavedPostResponseDto[];

    @Expose()
    @ApiProperty({
        nullable: true,
        example: '2025-11-13T09:00:00.000Z',
        description: 'Cursor for next page',
    })
    nextCursor?: string;

    @Expose()
    @ApiProperty({
        example: 10,
        description: 'Number of items returned',
    })
    total!: number;

    @Expose()
    @ApiProperty({
        example: true,
        description: 'Whether there are more items',
    })
    hasMore!: boolean;
}

export class DeleteSavedPostResponseDto {
    @Expose()
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'ID of the post that was unsaved',
    })
    postId!: string;

    @Expose()
    @ApiProperty({
        example: true,
        description: 'Whether the post was successfully unsaved',
    })
    success!: boolean;

    @Expose()
    @ApiProperty({
        example: 'Post has been removed from your saved posts',
        description: 'Success message',
    })
    message!: string;
}
