import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    // Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CancelOrderDto, GetOrdersQueryDto, PendingConfirmationQueryDto } from './dtos/order.dto';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    // ============ CUSTOMER ACTIONS ============

    @Post('accept-quote-direct/:quoteId')
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: '[Customer] Accept quote directly → Create PENDING order',
        description:
            'Customer accepts a PENDING quote at the exact quoted price (no negotiation). ' +
            'An order is created immediately in PENDING status and the quote moves to ORDER_REQUESTED. ' +
            'The technician must confirm via POST /orders/confirm-from-quote/:quoteId before the order becomes IN_PROGRESS. ' +
            'The technician may also decline via POST /orders/:id/provider-decline.',
    })
    @ApiResponse({ status: 201, description: 'Order created in PENDING status; awaiting technician confirmation' })
    @ApiResponse({ status: 400, description: 'Quote is not PENDING or an order already exists for it' })
    @ApiResponse({ status: 403, description: 'Caller is not the customer for this quote' })
    @ApiResponse({ status: 404, description: 'Quote not found' })
    async acceptQuoteDirect(
        @Param('quoteId') quoteId: string,
        @CurrentUserId('id') customerId: string,
    ) {
        return await this.orderService.createOrderFromDirectAcceptance(quoteId, customerId);
    }

    // ============ PROVIDER ACTIONS ============

    @Post('confirm-from-quote/:quoteId')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Confirm order → IN_PROGRESS',
        description:
            'Handles two flows based on whether a PENDING order already exists for the quote:\n\n' +
            '**Direct-acceptance flow** (customer used accept-quote-direct): ' +
            'Activates the pre-created PENDING order to IN_PROGRESS.\n\n' +
            '**Chat-negotiation flow** (quote in ORDER_REQUESTED after chat): ' +
            'Creates the order directly in IN_PROGRESS.',
    })
    @ApiResponse({ status: 200, description: 'Order confirmed and set to IN_PROGRESS' })
    @ApiResponse({ status: 400, description: 'Quote is not in ORDER_REQUESTED status, or the pre-existing order was already cancelled' })
    @ApiResponse({ status: 403, description: 'Caller is not the provider for this quote' })
    @ApiResponse({ status: 404, description: 'Quote not found' })
    async confirmOrderFromQuote(
        @Param('quoteId') quoteId: string,
        @CurrentUser('id') providerId: string,
    ) {
        return await this.orderService.createOrderFromQuoteConfirmation(quoteId, providerId);
    }

    @Post(':id/provider-decline')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Decline a PENDING order',
        description:
            'Provider declines to confirm a PENDING order that was created via the direct-acceptance flow. ' +
            'The order is cancelled and the associated quote is reset to CANCELLED. ' +
            'The customer is notified and may seek another provider.',
    })
    @ApiResponse({ status: 200, description: 'Order declined and cancelled' })
    @ApiResponse({ status: 400, description: 'Order is not in PENDING status or is not quote-based' })
    @ApiResponse({ status: 403, description: 'Caller is not the provider for this order' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async providerDeclineOrder(
        @Param('id') orderId: string,
        @CurrentUser('id') providerId: string,
        @Body() dto: CancelOrderDto,
    ) {
        return await this.orderService.providerDeclineOrder(orderId, providerId, dto);
    }

    @Post(':id/provider-complete')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: '[Provider] Mark work as done' })
    @ApiResponse({ status: 200, description: 'Success' })
    async providerComplete(
        @Param('id') orderId: string,
        @CurrentUser('id') providerId: string,
    ) {
        return await this.orderService.providerCompleteOrder(orderId, providerId);
    }

    // ============ CUSTOMER ACTIONS ============

    @Post(':id/customer-complete')
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Customer] Khách hàng xác nhận hoàn thành (finalize)',
        description: 'Khách xác nhận sau khi thợ đã hoàn thành → Order COMPLETED'
    })
    @ApiResponse({ status: 200, description: 'Success' })
    async customerComplete(
        @Param('id') orderId: string,
        @CurrentUser('id') customerId: string,
    ) {
        return await this.orderService.customerCompleteOrder(orderId, customerId);
    }

    // ============ COMMON ACTIONS ============

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách đơn hàng của tôi' })
    @ApiResponse({ status: 200, description: 'Success' })
    async getMyOrders(
        @CurrentUser('id') userId: string,
        @Query() query: GetOrdersQueryDto,
    ) {
        return await this.orderService.getUserOrders(userId, query.status);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Thống kê đơn hàng' })
    @ApiResponse({ status: 200, description: 'Success' })
    async getOrderStats(@CurrentUser('id') userId: string) {
        return await this.orderService.getOrderStats(userId);
    }

    @Get('awaiting-my-confirmation')
    @Roles(UserRole.PROVIDER)
    @ApiOperation({
        summary: '[Provider] List orders awaiting confirmation or rejection',
        description:
            'Returns a paginated list of PENDING orders that require the authenticated provider ' +
            'to explicitly confirm or decline. These orders are created when a customer uses ' +
            'POST /orders/accept-quote-direct/:quoteId (direct-acceptance flow).\n\n' +
            '**Next actions:**\n' +
            '- Confirm: `POST /orders/confirm-from-quote/:quoteId` → order becomes IN_PROGRESS\n' +
            '- Decline: `POST /orders/:id/provider-decline` → order is cancelled and the customer is notified\n\n' +
            'Results are ordered oldest-first so the most time-sensitive items appear at the top.',
    })
    @ApiResponse({
        status: 200,
        description: 'Paginated list of PENDING orders awaiting provider confirmation',
        schema: {
            properties: {
                data: { type: 'array', items: { type: 'object' } },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        totalPages: { type: 'number' },
                    },
                },
            },
        },
    })
    async getOrdersAwaitingConfirmation(
        @CurrentUser('id') providerId: string,
        @Query() query: PendingConfirmationQueryDto,
    ) {
        return await this.orderService.getOrdersAwaitingProviderConfirmation(
            providerId,
            query.page ?? 1,
            query.limit ?? 10,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Xem chi tiết đơn hàng' })
    @ApiResponse({ status: 200, description: 'Success' })
    async getOrder(
        @Param('id') orderId: string,
        @CurrentUser('id') userId: string,
    ) {
        return await this.orderService.getOrderById(orderId, userId);
    }

    @Get('number/:orderNumber')
    @ApiOperation({ summary: 'Xem đơn hàng theo mã số' })
    @ApiResponse({ status: 200, description: 'Success' })
    async getOrderByNumber(
        @Param('orderNumber') orderNumber: string,
        @CurrentUser('id') userId: string,
    ) {
        return await this.orderService.getOrderByNumber(orderNumber, userId);
    }

    @Post(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Hủy đơn hàng',
        description: 'Cả customer và provider đều có thể hủy. KHÔNG thể hủy sau 10 phút IN_PROGRESS'
    })
    @ApiResponse({ status: 200, description: 'Cancelled' })
    @ApiResponse({ status: 400, description: 'Cannot cancel after 10 minutes' })
    async cancelOrder(
        @Param('id') orderId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: CancelOrderDto,
    ) {
        return await this.orderService.cancelOrder(orderId, userId, dto);
    }

    // @Put(':id/notes')
    // @ApiOperation({ summary: 'Cập nhật ghi chú' })
    // @ApiResponse({ status: 200, description: 'Updated' })
    // async updateNotes(
    //     @Param('id') orderId: string,
    //     @CurrentUser('id') userId: string,
    //     @Body() dto: UpdateNotesDto,
    // ) {
    //     return await this.orderService.updateNotes(orderId, userId, dto.notes);
    // }
}