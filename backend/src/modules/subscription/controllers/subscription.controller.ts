import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    CancelSubscriptionDto,
    GetSubscriptionsQueryDto,
    SubscribeDto,
    SubscriptionResponseDto,
    SubscriptionStatusSummaryDto,
} from '../dtos/subscription.dto';
import {
    GetPaymentsQueryDto,
    PaymentListResponseDto,
} from '../dtos/subscription-payment.dto';
import { GetSubscriptionPlansQueryDto, SubscriptionPlanResponseDto } from '../dtos/subscription-plan.dto';
import { ValidateDiscountDto, DiscountValidationResultDto } from '../dtos/discount.dto';
import { PaymentCreationResult } from '../interfaces/subscription.interface';
import { SubscriptionPlanService } from '../services/subscription-plan.service';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionPaymentService } from '../services/subscription-payment.service';
import { DiscountService } from '../services/discount.service';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly planService: SubscriptionPlanService,
        private readonly paymentService: SubscriptionPaymentService,
        private readonly discountService: DiscountService,
    ) {}

    // ─── Plans (public listing) ───────────────────────────────────────────────

    @Get('plans')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'List available subscription plans',
        description: 'Returns all active subscription plans. Public endpoint — no auth required.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: [SubscriptionPlanResponseDto] })
    async getPlans(
        @Query() query: GetSubscriptionPlansQueryDto,
    ): Promise<SubscriptionPlanResponseDto[]> {
        return this.planService.getPlans({ ...query, activeOnly: true }) as any;
    }

    // ─── Discount validation ─────────────────────────────────────────────────

    @Post('discounts/validate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Validate a discount code',
        description: 'Check whether a discount code is valid for a given billing cycle and see the computed savings.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: DiscountValidationResultDto })
    async validateDiscount(
        @Body() dto: ValidateDiscountDto,
    ): Promise<DiscountValidationResultDto> {
        const plans = await this.planService.getPlans({ billingCycle: dto.billingCycle });
        const planPrice = plans.length > 0 ? Number(plans[0].price) : 0;
        return this.discountService.validateDiscountCode(dto.code, dto.billingCycle, planPrice);
    }

    // ─── My subscription ─────────────────────────────────────────────────────

    @Get('my')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get my subscription',
        description: 'Returns the authenticated provider\'s current subscription with plan details.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: SubscriptionResponseDto })
    async getMySubscription(
        @CurrentUser() user: JwtPayload,
    ): Promise<SubscriptionResponseDto> {
        return this.subscriptionService.getMySubscription(user.id) as any;
    }

    @Get('my/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get subscription status summary',
        description: 'Returns a concise status summary: whether access is allowed, days until expiry, and a human-readable message.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: SubscriptionStatusSummaryDto })
    async getMySubscriptionStatus(
        @CurrentUser() user: JwtPayload,
    ): Promise<SubscriptionStatusSummaryDto> {
        return this.subscriptionService.getMySubscriptionStatus(user.id);
    }

    // ─── Subscribe / Cancel ──────────────────────────────────────────────────

    @Post('subscribe')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Subscribe to a plan',
        description:
            'Creates a pending payment for the chosen plan. ' +
            'An admin must confirm the payment to activate the subscription. ' +
            'An optional discount code can be provided.',
    })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Payment created — awaiting admin confirmation' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Already active or pending payment exists' })
    async subscribe(
        @CurrentUser() user: JwtPayload,
        @Body() dto: SubscribeDto,
    ): Promise<PaymentCreationResult> {
        return this.subscriptionService.subscribe(user.id, dto);
    }

    @Patch('cancel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Cancel subscription',
        description: 'Cancels the current subscription. Access remains until the end of the current period.',
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Subscription cancelled' })
    async cancelSubscription(
        @CurrentUser() user: JwtPayload,
        @Body() dto: CancelSubscriptionDto,
    ): Promise<{ success: boolean; message: string }> {
        await this.subscriptionService.cancelSubscription(user.id, dto);
        return { success: true, message: 'Subscription cancelled successfully' };
    }

    // ─── My payments ─────────────────────────────────────────────────────────

    @Get('my/payments')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get my payment history',
        description: 'Returns all payment records for the authenticated provider, paginated.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: PaymentListResponseDto })
    async getMyPayments(
        @CurrentUser() user: JwtPayload,
        @Query() query: GetPaymentsQueryDto,
    ): Promise<PaymentListResponseDto> {
        const { payments, total } = await this.paymentService.getMyPayments(user.id, query);
        return {
            payments: payments as any,
            total,
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        };
    }

    @Delete('my/payments/pending')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Cancel pending payment',
        description:
            'Cancels the current pending payment and its associated Stripe PaymentIntent. ' +
            'Use this if you want to change your plan or retry with a different card.',
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Pending payment cancelled' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No pending payment found' })
    async cancelPendingPayment(
        @CurrentUser() user: JwtPayload,
    ): Promise<{ success: boolean; message: string }> {
        await this.paymentService.cancelPendingPayment(user.id);
        return { success: true, message: 'Pending payment cancelled successfully' };
    }
}
