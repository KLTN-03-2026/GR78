import { NotificationType } from '@/modules/notifications/enums/notification.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetNotificationsQueryDto {
    @ApiPropertyOptional({ description: 'Number of pages', default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Quantity/page', default: 20 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 20;

    @ApiPropertyOptional({ description: 'Only take unread', default: false })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    unreadOnly?: boolean = false;
}


export class NotificationResponseDto {
    @ApiProperty({ description: 'ID notification' })
    @Expose()
    id!: string;

    @ApiProperty({ description: 'ID user' })
    @Expose()
    userId?: string;

    @ApiProperty({
        description: 'Notification Type',
        enum: NotificationType,
    })
    @Expose()
    type?: NotificationType;

    @ApiProperty({ description: 'Tilte' })
    @Expose()
    title?: string;

    @ApiProperty({ description: 'Content' })
    @Expose()
    message?: string;

    @ApiPropertyOptional({ description: 'Additional data' })
    @Expose()
    metadata?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Action URL' })
    @Expose()
    actionUrl?: string;

    @ApiProperty({ description: 'Have you read it?' })
    @Expose()
    isRead!: boolean;

    @ApiPropertyOptional({ description: 'Reading time' })
    @Expose()
    @Type(() => Date)
    readAt?: Date;

    @ApiProperty({ description: 'Creation time' })
    @Expose()
    @Type(() => Date)
    createdAt?: Date;
}


export class NotificationListResponseDto {
    @ApiProperty({
        description: 'List of notifications',
        type: [NotificationResponseDto],
    })
    @Expose()
    @Type(() => NotificationResponseDto)
    notifications?: NotificationResponseDto[];

    @ApiProperty({ description: 'Total number of notifications' })
    @Expose()
    total?: number;

    @ApiProperty({ description: 'Number of unread notifications' })
    @Expose()
    unreadCount?: number;
}


export class UnreadCountResponseDto {
    @ApiProperty({ description: 'Number of unread notifications' })
    count?: number;
}

export class SuccessResponseDto {
    @ApiProperty({ description: 'Success status' })
    success!: boolean;
}


export class CreateNotification {
    userId?: string;
    type?: NotificationType;
    title?: string;
    message?: string;
    metadata?: Record<string, any>;
    actionUrl?: string;
}