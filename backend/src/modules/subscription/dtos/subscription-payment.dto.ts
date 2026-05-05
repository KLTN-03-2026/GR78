import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { SubscriptionPaymentStatus } from '../enums/subscription-payment-status.enum';
import { SubscriptionPlanResponseDto } from './subscription-plan.dto';

export class GetPaymentsQueryDto {
    @ApiPropertyOptional({ enum: SubscriptionPaymentStatus })
    @IsOptional()
    @IsEnum(SubscriptionPaymentStatus)
    status?: SubscriptionPaymentStatus;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 20;
}

export class ConfirmPaymentDto {
    @ApiPropertyOptional({ description: 'Admin notes about the payment' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class RefundPaymentDto {
    @ApiPropertyOptional({ description: 'Reason for refund' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class SubscriptionPaymentResponseDto {
    @ApiProperty()
    @Expose()
    id!: string;

    @ApiProperty()
    @Expose()
    subscriptionId!: string;

    @ApiProperty()
    @Expose()
    userId!: string;

    @ApiPropertyOptional()
    @Expose()
    planId?: string;

    @ApiPropertyOptional({ type: () => SubscriptionPlanResponseDto })
    @Expose()
    @Type(() => SubscriptionPlanResponseDto)
    plan?: SubscriptionPlanResponseDto;

    @ApiProperty()
    @Expose()
    amount!: number;

    @ApiPropertyOptional()
    @Expose()
    discountId?: string;

    @ApiProperty()
    @Expose()
    discountAmount!: number;

    @ApiProperty()
    @Expose()
    finalAmount!: number;

    @ApiProperty({ enum: SubscriptionPaymentStatus })
    @Expose()
    status!: SubscriptionPaymentStatus;

    @ApiPropertyOptional()
    @Expose()
    dueDate?: Date;

    @ApiPropertyOptional()
    @Expose()
    paidAt?: Date;

    @ApiPropertyOptional()
    @Expose()
    notes?: string;

    @ApiProperty()
    @Expose()
    createdAt!: Date;

    @ApiProperty()
    @Expose()
    updatedAt!: Date;
}

export class PaymentListResponseDto {
    @ApiProperty({ type: [SubscriptionPaymentResponseDto] })
    @Expose()
    @Type(() => SubscriptionPaymentResponseDto)
    payments!: SubscriptionPaymentResponseDto[];

    @ApiProperty()
    @Expose()
    total!: number;

    @ApiProperty()
    @Expose()
    page!: number;

    @ApiProperty()
    @Expose()
    limit!: number;
}
