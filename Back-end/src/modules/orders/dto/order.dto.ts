import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsISO8601,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';
import { OrderStatus, PaymentMethod } from '../entities/order.entity';

export class CreateOrderDto {
    @ApiProperty({ description: 'Provider ID' })
    @IsUUID()
    providerId!: string;

    @ApiProperty({ description: 'Tiêu đề dịch vụ' })
    @IsString()
    @MaxLength(500)
    title!: string;

    @ApiProperty({ description: 'Mô tả chi tiết' })
    @IsString()
    @MaxLength(5000)
    description!: string;

    @ApiProperty({ description: 'Giá dịch vụ', example: 500000 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price!: number;

    @ApiPropertyOptional({ description: 'Địa điểm thực hiện' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    location?: string;

    @ApiPropertyOptional({
        description: 'Thời gian mong muốn (ISO 8601)',
        example: '2025-01-20T09:00:00Z'
    })
    @IsOptional()
    @IsISO8601()
    scheduledAt?: Date;

    @ApiPropertyOptional({ description: 'Thời gian ước tính (phút)', example: 120 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    estimatedDuration?: number;

    @ApiPropertyOptional({ description: 'Ghi chú thêm' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;
}

export class CancelOrderDto {
    @ApiPropertyOptional({ description: 'Lý do hủy' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    reason?: string;
}

export class UpdatePaymentMethodDto {
    @ApiProperty({
        enum: PaymentMethod,
        description: 'Phương thức thanh toán'
    })
    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;
}

export class UpdateNotesDto {
    @ApiProperty({ description: 'Ghi chú' })
    @IsString()
    @MaxLength(2000)
    notes!: string;
}

export class GetOrdersQueryDto {
    @ApiPropertyOptional({
        enum: OrderStatus,
        description: 'Lọc theo trạng thái'
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}







export class OrderResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    orderNumber!: string;

    @ApiProperty()
    customerId!: string;

    @ApiProperty()
    providerId!: string;

    @ApiProperty()
    title!: string;

    @ApiProperty()
    description!: string;

    @ApiProperty()
    price!: number;

    @ApiProperty()
    serviceFee!: number;

    @ApiProperty()
    totalAmount!: number;

    @ApiProperty({ enum: OrderStatus })
    status!: OrderStatus;

    @ApiProperty()
    paymentStatus!: string;

    @ApiProperty({ required: false })
    paymentMethod?: string;

    @ApiProperty({ required: false })
    scheduledAt?: Date;

    @ApiProperty({ required: false })
    startedAt?: Date;

    @ApiProperty({ required: false })
    providerCompletedAt?: Date;

    @ApiProperty({ required: false })
    customerCompletedAt?: Date;

    @ApiProperty({ required: false })
    completedAt?: Date;

    @ApiProperty()
    createdAt!: Date;
}