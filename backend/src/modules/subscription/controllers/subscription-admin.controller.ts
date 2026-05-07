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
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    CreateDiscountDto,
    DiscountResponseDto,
    GetDiscountsQueryDto,
    UpdateDiscountDto,
} from '../dtos/discount.dto';
import {
    ConfirmPaymentDto,
    GetPaymentsQueryDto,
    PaymentListResponseDto,
    RefundPaymentDto,
    SubscriptionPaymentResponseDto,
} from '../dtos/subscription-payment.dto';
import {
    CreateSubscriptionPlanDto,
    GetSubscriptionPlansQueryDto,
    SubscriptionPlanResponseDto,
    UpdateSubscriptionPlanDto,
} from '../dtos/subscription-plan.dto';
import {
    AdminUpdateSubscriptionDto,
    GetSubscriptionsQueryDto,
    SubscriptionResponseDto,
} from '../dtos/subscription.dto';
import { DiscountService } from '../services/discount.service';
import { SubscriptionPaymentService } from '../services/subscription-payment.service';
import { SubscriptionPlanService } from '../services/subscription-plan.service';
import { SubscriptionService } from '../services/subscription.service';

@ApiTags('Admin — Subscription')
@Controller('admin/subscription')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class SubscriptionAdminController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly planService: SubscriptionPlanService,
        private readonly discountService: DiscountService,
        private readonly paymentService: SubscriptionPaymentService,
    ) {}

    // ─── Plans ───────────────────────────────────────────────────────────────

    @Get('plans')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'List all subscription plans (admin)' })
    @ApiResponse({ status: HttpStatus.OK, type: [SubscriptionPlanResponseDto] })
    async getPlans(
        @Query() query: GetSubscriptionPlansQueryDto,
    ): Promise<SubscriptionPlanResponseDto[]> {
        return this.planService.getPlans({ ...query, activeOnly: false }) as any;
    }

    @Get('plans/:id')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', description: 'Plan UUID' })
    @ApiOperation({ summary: 'Get a specific subscription plan' })
    @ApiResponse({ status: HttpStatus.OK, type: SubscriptionPlanResponseDto })
    async getPlanById(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<SubscriptionPlanResponseDto> {
        return this.planService.getPlanById(id) as any;
    }

    @Post('plans')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a subscription plan',
        description: 'Create a new monthly or annual plan that providers can subscribe to.',
    })
    @ApiResponse({ status: HttpStatus.CREATED, type: SubscriptionPlanResponseDto })
    async createPlan(
        @Body() dto: CreateSubscriptionPlanDto,
    ): Promise<SubscriptionPlanResponseDto> {
        return this.planService.createPlan(dto) as any;
    }

    @Patch('plans/:id')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', description: 'Plan UUID' })
    @ApiOperation({
        summary: 'Update a subscription plan',
        description: 'Modify a plan\'s name, price, features, or active status. Price changes only affect new subscriptions.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: SubscriptionPlanResponseDto })
    async updatePlan(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateSubscriptionPlanDto,
    ): Promise<SubscriptionPlanResponseDto> {
        return this.planService.updatePlan(id, dto) as any;
    }

    @Delete('plans/:id')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', description: 'Plan UUID' })
    @ApiOperation({
        summary: 'Deactivate a subscription plan',
        description: 'Marks the plan as inactive. Existing subscriptions are unaffected.',
    })
    @ApiResponse({ status: HttpStatus.OK })
    async deactivatePlan(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<{ success: boolean; message: string }> {
        await this.planService.deactivatePlan(id);
        return { success: true, message: 'Plan deactivated successfully' };
    }

    // ─── Discounts ───────────────────────────────────────────────────────────

    @Get('discounts')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'List all discount codes' })
    @ApiResponse({ status: HttpStatus.OK, type: [DiscountResponseDto] })
    async getDiscounts(
        @Query() query: GetDiscountsQueryDto,
    ): Promise<DiscountResponseDto[]> {
        return this.discountService.getDiscounts(query) as any;
    }

    @Get('discounts/:id')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', description: 'Discount UUID' })
    @ApiOperation({ summary: 'Get a specific discount code' })
    @ApiResponse({ status: HttpStatus.OK, type: DiscountResponseDto })
    async getDiscountById(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<DiscountResponseDto> {
        return this.discountService.getDiscountById(id) as any;
    }

    @Post('discounts')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a discount code',
        description: 'Create a new promotional discount — percentage-based or a fixed VND amount. Optionally restrict to a specific billing cycle.',
    })
    @ApiResponse({ status: HttpStatus.CREATED, type: DiscountResponseDto })
    async createDiscount(
        @Body() dto: CreateDiscountDto,
    ): Promise<DiscountResponseDto> {
        return this.discountService.createDiscount(dto) as any;
    }

    @Patch('discounts/:id')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', description: 'Discount UUID' })
    @ApiOperation({
        summary: 'Update a discount code',
        description: 'Modify discount details or toggle active status.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: DiscountResponseDto })
    async updateDiscount(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateDiscountDto,
    ): Promise<DiscountResponseDto> {
        return this.discountService.updateDiscount(id, dto) as any;
    }

    @Delete('discounts/:id')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', description: 'Discount UUID' })
    @ApiOperation({
        summary: 'Delete a discount code',
        description: 'Permanently removes the discount record.',
    })
    @ApiResponse({ status: HttpStatus.OK })
    async deleteDiscount(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<{ success: boolean; message: string }> {
        await this.discountService.deleteDiscount(id);
        return { success: true, message: 'Discount deleted successfully' };
    }

    // ─── Subscriptions ───────────────────────────────────────────────────────

    @Get('subscriptions')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'List all provider subscriptions' })
    @ApiResponse({ status: HttpStatus.OK })
    async getAllSubscriptions(
        @Query() query: GetSubscriptionsQueryDto,
    ): Promise<{ subscriptions: SubscriptionResponseDto[]; total: number }> {
        const { subscriptions, total } = await this.subscriptionService.getAllSubscriptions(query);
        return { subscriptions: subscriptions as any, total };
    }

    @Patch('subscriptions/:id')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', description: 'Subscription UUID' })
    @ApiOperation({
        summary: 'Admin update a subscription',
        description: 'Manually override subscription status or toggle auto-renew.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: SubscriptionResponseDto })
    async adminUpdateSubscription(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AdminUpdateSubscriptionDto,
    ): Promise<SubscriptionResponseDto> {
        return this.subscriptionService.adminUpdateSubscription(id, dto) as any;
    }

    // ─── Payments ────────────────────────────────────────────────────────────

    @Get('payments')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'List all subscription payments' })
    @ApiResponse({ status: HttpStatus.OK, type: PaymentListResponseDto })
    async getAllPayments(
        @Query() query: GetPaymentsQueryDto,
    ): Promise<PaymentListResponseDto> {
        const { payments, total } = await this.paymentService.getAllPayments(query);
        return {
            payments: payments as any,
            total,
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        };
    }

    @Get('payments/:id')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', description: 'Payment UUID' })
    @ApiOperation({ summary: 'Get a specific payment record' })
    @ApiResponse({ status: HttpStatus.OK, type: SubscriptionPaymentResponseDto })
    async getPaymentById(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<SubscriptionPaymentResponseDto> {
        const payment = await this.paymentService['paymentRepo'].findById(id);
        if (!payment) {
            throw new (await import('../exceptions/subscription.exception')).PaymentNotFoundException();
        }
        return payment as any;
    }

    @Patch('payments/:id/confirm')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', description: 'Payment UUID' })
    @ApiOperation({
        summary: 'Confirm a pending payment',
        description:
            'Marks the payment as paid and activates the provider\'s subscription for the plan period. ' +
            'The subscription period is calculated from the confirmation date.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: SubscriptionPaymentResponseDto })
    async confirmPayment(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ConfirmPaymentDto,
    ): Promise<SubscriptionPaymentResponseDto> {
        return this.paymentService.confirmPayment(id, dto.notes) as any;
    }

    @Patch('payments/:id/refund')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'id', description: 'Payment UUID' })
    @ApiOperation({
        summary: 'Refund a confirmed payment',
        description: 'Marks the payment as refunded and cancels the subscription.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: SubscriptionPaymentResponseDto })
    async refundPayment(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: RefundPaymentDto,
    ): Promise<SubscriptionPaymentResponseDto> {
        return this.paymentService.refundPayment(id, dto.notes) as any;
    }
}
