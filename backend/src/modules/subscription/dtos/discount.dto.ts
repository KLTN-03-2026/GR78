import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
    Matches,
} from 'class-validator';
import { BillingCycle } from '../enums/billing-cycle.enum';
import { DiscountType } from '../enums/discount-type.enum';

export class CreateDiscountDto {
    @ApiProperty({ example: 'SUMMER2025', description: 'Unique discount code (uppercase, no spaces)' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[A-Z0-9_-]+$/, { message: 'Code must be uppercase letters, numbers, underscores, or hyphens' })
    code!: string;

    @ApiProperty({ example: 'Summer promotion 2025' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: DiscountType })
    @IsEnum(DiscountType)
    discountType!: DiscountType;

    @ApiProperty({ example: 20, description: 'Percentage (0-100) or fixed amount in VND' })
    @IsNumber()
    @IsPositive()
    discountValue!: number;

    @ApiPropertyOptional({ enum: BillingCycle, description: 'Null = applies to all plans' })
    @IsOptional()
    @IsEnum(BillingCycle)
    applicableBillingCycle?: BillingCycle;

    @ApiPropertyOptional({ description: 'Max discount cap in VND (for percentage discounts)' })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    maxDiscountAmount?: number;

    @ApiProperty({ example: '2025-06-01T00:00:00Z' })
    @IsDate()
    @Type(() => Date)
    validFrom!: Date;

    @ApiPropertyOptional({ example: '2025-08-31T23:59:59Z', description: 'Null = no expiry' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    validUntil?: Date;

    @ApiPropertyOptional({ description: 'Max total uses. Null = unlimited' })
    @IsOptional()
    @IsInt()
    @IsPositive()
    usageLimit?: number;
}

export class UpdateDiscountDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    discountValue?: number;

    @ApiPropertyOptional({ enum: BillingCycle })
    @IsOptional()
    @IsEnum(BillingCycle)
    applicableBillingCycle?: BillingCycle;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    maxDiscountAmount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    validFrom?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    validUntil?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @IsPositive()
    usageLimit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class GetDiscountsQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    activeOnly?: boolean;

    @ApiPropertyOptional({ enum: BillingCycle })
    @IsOptional()
    @IsEnum(BillingCycle)
    billingCycle?: BillingCycle;

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

export class ValidateDiscountDto {
    @ApiProperty({ example: 'SUMMER2025' })
    @IsString()
    code!: string;

    @ApiProperty({ enum: BillingCycle })
    @IsEnum(BillingCycle)
    billingCycle!: BillingCycle;
}

export class DiscountResponseDto {
    @ApiProperty()
    @Expose()
    id!: string;

    @ApiProperty()
    @Expose()
    code!: string;

    @ApiProperty()
    @Expose()
    name!: string;

    @ApiPropertyOptional()
    @Expose()
    description?: string;

    @ApiProperty({ enum: DiscountType })
    @Expose()
    discountType!: DiscountType;

    @ApiProperty()
    @Expose()
    discountValue!: number;

    @ApiPropertyOptional({ enum: BillingCycle })
    @Expose()
    applicableBillingCycle?: BillingCycle;

    @ApiPropertyOptional()
    @Expose()
    maxDiscountAmount?: number;

    @ApiProperty()
    @Expose()
    validFrom!: Date;

    @ApiPropertyOptional()
    @Expose()
    validUntil?: Date;

    @ApiPropertyOptional()
    @Expose()
    usageLimit?: number;

    @ApiProperty()
    @Expose()
    usageCount!: number;

    @ApiProperty()
    @Expose()
    isActive!: boolean;

    @ApiProperty()
    @Expose()
    createdAt!: Date;
}

export class DiscountValidationResultDto {
    @ApiProperty()
    valid!: boolean;

    @ApiPropertyOptional()
    discountAmount?: number;

    @ApiPropertyOptional()
    finalAmount?: number;

    @ApiPropertyOptional()
    discount?: DiscountResponseDto;

    @ApiPropertyOptional()
    message?: string;
}
