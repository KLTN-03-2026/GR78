import { CurrentUser } from '@/common/decorators/@CurrentUser';
import { Roles } from '@/common/decorators/@Roles';
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
import { CancelOrderDto, GetOrdersQueryDto } from './dto/order.dto';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    // ============ PROVIDER ACTIONS ============

    @Post('confirm-from-quote/:quoteId')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: '[Provider] Xác nhận làm → Tạo order',
        description: 'Provider xác nhận sau khi customer nhấn đặt đơn. Order được tạo với trạng thái IN_PROGRESS'
    })
    @ApiResponse({ status: 201, description: 'Order created' })
    async confirmOrderFromQuote(
        @Param('quoteId') quoteId: string,
        @CurrentUser('id') providerId: string,
    ) {
        return await this.orderService.createOrderFromQuoteConfirmation(
            quoteId,
            providerId,
        );
    }

    @Post(':id/provider-complete')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: '[Provider] Thợ xác nhận hoàn thành' })
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