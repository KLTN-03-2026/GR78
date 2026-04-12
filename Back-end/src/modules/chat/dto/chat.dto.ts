import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsInt,
    IsISO8601,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class SendMessageDto {
    @ApiProperty({ enum: MessageType, description: 'Loại tin nhắn' })
    @IsEnum(MessageType)
    type!: MessageType;

    @ApiPropertyOptional({ description: 'Nội dung tin nhắn (nếu là text)' })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    content?: string;

    @ApiPropertyOptional({ description: 'Danh sách URL files', type: [String] })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    fileUrls?: string[];

    @ApiPropertyOptional({ description: 'Tên files', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    fileNames?: string[];
}

export class CreateDirectConversationDto {
    @ApiProperty({ description: 'Provider ID' })
    @IsUUID()
    providerId!: string;
}

export class GetMessagesQueryDto {
    @ApiPropertyOptional({ description: 'Số lượng messages', default: 50 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 50;

    @ApiPropertyOptional({
        description: 'Lấy messages trước thời điểm này (ISO 8601)',
        example: '2025-01-15T10:00:00Z'
    })
    @IsOptional()
    @IsISO8601()
    before?: string;
}




export class ConversationResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    customerId!: string;

    @ApiProperty()
    providerId!: string;

    @ApiProperty({ required: false })
    quoteId?: string;

    @ApiProperty()
    type!: string;

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty({ required: false })
    lastMessageAt?: Date;

    @ApiProperty({ required: false })
    lastMessagePreview?: string;

    @ApiProperty()
    customerUnreadCount!: number;

    @ApiProperty()
    providerUnreadCount!: number;

    @ApiProperty()
    createdAt!: Date;
}

export class MessageResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    conversationId!: string;

    @ApiProperty()
    senderId!: string;

    @ApiProperty({ enum: MessageType })
    type!: MessageType;

    @ApiProperty({ required: false })
    content?: string;

    @ApiProperty({ type: [String] })
    fileUrls!: string[];

    @ApiProperty()
    isRead!: boolean;

    @ApiProperty({ required: false })
    readAt?: Date;

    @ApiProperty()
    createdAt!: Date;
}