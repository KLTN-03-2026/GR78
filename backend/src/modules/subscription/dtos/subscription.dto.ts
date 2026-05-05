import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from 'class-validator';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { DiscountResponseDto } from './discount.dto';
import { SubscriptionPlanResponseDto } from './subscription-plan.dto';

export class SubscribeDto {
    @ApiProperty({ description: 'Plan ID to subscribe to' })
    @IsUUID()
    planId!: string;

    @ApiPropertyOptional({ description: 'Discount code to apply' })
    @IsOptional()
    @IsString()
    discountCode?: string;
}

export class CancelSubscriptionDto {
    @ApiPropertyOptional({ description: 'Reason for cancellation' })
    @IsOptional()
    @IsString()
    reason?: string;
}

export class GetSubscriptionsQueryDto {
    @ApiPropertyOptional({ enum: SubscriptionStatus })
    @IsOptional()
    @IsEnum(SubscriptionStatus)
    status?: SubscriptionStatus;

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

export class SubscriptionResponseDto {
    @ApiProperty()
    @Expose()
    id!: string;

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

    @ApiProperty({ enum: SubscriptionStatus })
    @Expose()
    status!: SubscriptionStatus;

    @ApiPropertyOptional()
    @Expose()
    trialStartDate?: Date;

    @ApiPropertyOptional()
    @Expose()
    trialEndDate?: Date;

    @ApiPropertyOptional()
    @Expose()
    currentPeriodStart?: Date;

    @ApiPropertyOptional()
    @Expose()
    currentPeriodEnd?: Date;

    @ApiProperty()
    @Expose()
    autoRenew!: boolean;

    @ApiPropertyOptional()
    @Expose()
    cancelledAt?: Date;

    @ApiPropertyOptional()
    @Expose()
    cancellationReason?: string;

    @ApiPropertyOptional({ type: () => DiscountResponseDto })
    @Expose()
    @Type(() => DiscountResponseDto)
    discount?: DiscountResponseDto;

    @ApiProperty()
    @Expose()
    createdAt!: Date;

    @ApiProperty()
    @Expose()
    updatedAt!: Date;

    @ApiPropertyOptional({ description: 'Days until trial/subscription expires' })
    @Expose()
    daysUntilExpiry?: number;

    @ApiPropertyOptional()
    @Expose()
    isAccessAllowed?: boolean;
}

export class SubscriptionStatusSummaryDto {
    @ApiProperty()
    @Expose()
    isAccessAllowed!: boolean;

    @ApiProperty({ enum: SubscriptionStatus })
    @Expose()
    status!: SubscriptionStatus;

    @ApiPropertyOptional()
    @Expose()
    daysUntilExpiry?: number;

    @ApiPropertyOptional()
    @Expose()
    trialEndDate?: Date;

    @ApiPropertyOptional()
    @Expose()
    currentPeriodEnd?: Date;

    @ApiPropertyOptional({ description: 'Message shown to the user about their subscription state' })
    @Expose()
    statusMessage?: string;
}

export class AdminUpdateSubscriptionDto {
    @ApiPropertyOptional({ enum: SubscriptionStatus })
    @IsOptional()
    @IsEnum(SubscriptionStatus)
    status?: SubscriptionStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    autoRenew?: boolean;
}
