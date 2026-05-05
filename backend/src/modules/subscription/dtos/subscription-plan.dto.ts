import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
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
} from 'class-validator';
import { BillingCycle } from '../enums/billing-cycle.enum';

export class CreateSubscriptionPlanDto {
    @ApiProperty({ example: 'Monthly Basic' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @ApiPropertyOptional({ example: 'Full access for one month' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: BillingCycle, example: BillingCycle.MONTHLY })
    @IsEnum(BillingCycle)
    billingCycle!: BillingCycle;

    @ApiProperty({ example: 99000, description: 'Price in VND' })
    @IsNumber()
    @IsPositive()
    price!: number;

    @ApiPropertyOptional({ type: [String], example: ['Post service requests', 'Accept quotes', 'Chat with customers'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    features?: string[];

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class UpdateSubscriptionPlanDto {
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

    @ApiPropertyOptional({ description: 'Price in VND' })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    features?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class GetSubscriptionPlansQueryDto {
    @ApiPropertyOptional({ enum: BillingCycle })
    @IsOptional()
    @IsEnum(BillingCycle)
    billingCycle?: BillingCycle;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    activeOnly?: boolean = true;

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

export class SubscriptionPlanResponseDto {
    @ApiProperty()
    @Expose()
    id!: string;

    @ApiProperty()
    @Expose()
    name!: string;

    @ApiPropertyOptional()
    @Expose()
    description?: string;

    @ApiProperty({ enum: BillingCycle })
    @Expose()
    billingCycle!: BillingCycle;

    @ApiProperty()
    @Expose()
    price!: number;

    @ApiPropertyOptional({ type: [String] })
    @Expose()
    features?: string[];

    @ApiProperty()
    @Expose()
    isActive!: boolean;

    @ApiProperty()
    @Expose()
    sortOrder!: number;

    @ApiProperty()
    @Expose()
    createdAt!: Date;

    @ApiProperty()
    @Expose()
    updatedAt!: Date;
}
