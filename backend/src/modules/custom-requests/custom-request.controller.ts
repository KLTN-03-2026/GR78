import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { Quote } from '@/modules/quotes/entities/quote.entity';
import { QuoteResponseDto } from '@/modules/quotes/dtos/quote.dto';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
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
    AcceptCustomRequestDto,
    CreateCustomRequestDto,
    CustomRequestListResponseDto,
    CustomRequestResponseDto,
    GetCustomRequestsQueryDto,
    RejectCustomRequestDto,
} from './dtos/custom-request.dto';
import { CustomRequestService } from './services/custom-request.service';

@ApiTags('Custom Requests')
@Controller('custom-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomRequestController {
    constructor(private readonly customRequestService: CustomRequestService) {}

    @Post()
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: '[Customer] Gửi yêu cầu riêng tới thợ',
        description:
            'Khách hàng gửi yêu cầu dịch vụ trực tiếp tới một thợ cụ thể. Nội dung tương tự như tạo post công khai.',
    })
    @ApiResponse({ status: 201, description: 'Request sent successfully', type: CustomRequestResponseDto })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @ApiResponse({ status: 404, description: 'Provider not found' })
    async createRequest(
        @CurrentUserId('id') customerId: string,
        @Body() dto: CreateCustomRequestDto,
    ): Promise<CustomRequestResponseDto> {
        return await this.customRequestService.createRequest(customerId, dto);
    }

    @Post(':id/accept')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Chấp nhận yêu cầu riêng và gửi báo giá',
        description:
            'Thợ chấp nhận yêu cầu của khách và đồng thời gửi báo giá. Khách hàng sẽ nhận thông báo kèm giá báo và có thể xem chi tiết tại GET /custom-requests/:id/quote.',
    })
    @ApiResponse({ status: 200, description: 'Request accepted and quote created', type: CustomRequestResponseDto })
    @ApiResponse({ status: 400, description: 'Request is not in pending state or price exceeds 150% of budget' })
    @ApiResponse({ status: 403, description: 'Not authorized' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    async acceptRequest(
        @Param('id', ParseUUIDPipe) requestId: string,
        @CurrentUserId('id') providerId: string,
        @Body() dto: AcceptCustomRequestDto,
    ): Promise<CustomRequestResponseDto> {
        return await this.customRequestService.acceptRequest(requestId, providerId, dto);
    }

    @Get(':id/quote')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Xem báo giá của thợ cho yêu cầu riêng',
        description:
            'Cả khách hàng và thợ đều có thể xem chi tiết báo giá mà thợ đã gửi khi chấp nhận yêu cầu. Từ đây khách hàng tiếp tục luồng chấp nhận/từ chối báo giá qua /quotes/:quoteId.',
    })
    @ApiResponse({ status: 200, description: 'Quote detail', type: QuoteResponseDto })
    @ApiResponse({ status: 400, description: 'Request has not been accepted yet' })
    @ApiResponse({ status: 403, description: 'No access' })
    @ApiResponse({ status: 404, description: 'Request or quote not found' })
    async getQuoteForRequest(
        @Param('id', ParseUUIDPipe) requestId: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<QuoteResponseDto> {
        const quote = await this.customRequestService.getQuoteForRequest(requestId, user.id);
        return this.toQuoteResponseDto(quote);
    }

    @Post(':id/reject')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Từ chối yêu cầu riêng',
        description: 'Thợ từ chối yêu cầu của khách hàng, có thể kèm lý do.',
    })
    @ApiResponse({ status: 200, description: 'Request rejected', type: CustomRequestResponseDto })
    @ApiResponse({ status: 400, description: 'Request is not in pending state' })
    @ApiResponse({ status: 403, description: 'Not authorized' })
    @ApiResponse({ status: 404, description: 'Request not found' })
    async rejectRequest(
        @Param('id', ParseUUIDPipe) requestId: string,
        @CurrentUserId('id') providerId: string,
        @Body() dto: RejectCustomRequestDto,
    ): Promise<CustomRequestResponseDto> {
        return await this.customRequestService.rejectRequest(requestId, providerId, dto.reason);
    }

    @Get('my/sent')
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Customer] Danh sách yêu cầu riêng đã gửi',
        description: 'Khách hàng xem các yêu cầu riêng mà mình đã gửi cho thợ.',
    })
    @ApiResponse({ status: 200, description: 'Success', type: CustomRequestListResponseDto })
    async getMySentRequests(
        @CurrentUserId('id') customerId: string,
        @Query() query: GetCustomRequestsQueryDto,
    ): Promise<CustomRequestListResponseDto> {
        return await this.customRequestService.getCustomerRequests(customerId, query);
    }

    @Get('my/received')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Danh sách yêu cầu riêng nhận được',
        description: 'Thợ xem các yêu cầu riêng mà khách hàng đã gửi tới mình.',
    })
    @ApiResponse({ status: 200, description: 'Success', type: CustomRequestListResponseDto })
    async getMyReceivedRequests(
        @CurrentUserId('id') providerId: string,
        @Query() query: GetCustomRequestsQueryDto,
    ): Promise<CustomRequestListResponseDto> {
        return await this.customRequestService.getProviderRequests(providerId, query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Xem chi tiết yêu cầu riêng',
        description: 'Cả khách hàng và thợ đều có thể xem chi tiết yêu cầu mà họ tham gia.',
    })
    @ApiResponse({ status: 200, description: 'Success', type: CustomRequestResponseDto })
    @ApiResponse({ status: 403, description: 'No access' })
    @ApiResponse({ status: 404, description: 'Not found' })
    async getRequestById(
        @Param('id', ParseUUIDPipe) requestId: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<CustomRequestResponseDto> {
        return await this.customRequestService.getRequestById(requestId, user.id);
    }

    @Delete(':id')
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Customer] Xóa yêu cầu riêng',
        description: 'Khách hàng xóa yêu cầu khi còn ở trạng thái PENDING.',
    })
    @ApiResponse({ status: 200, description: 'Deleted successfully' })
    @ApiResponse({ status: 400, description: 'Cannot delete non-pending request' })
    @ApiResponse({ status: 403, description: 'Not authorized' })
    async deleteRequest(
        @Param('id', ParseUUIDPipe) requestId: string,
        @CurrentUserId('id') customerId: string,
    ): Promise<{ success: boolean; message: string }> {
        await this.customRequestService.deleteRequest(requestId, customerId);
        return { success: true, message: 'Custom request deleted successfully' };
    }

    private toQuoteResponseDto(quote: Quote): QuoteResponseDto {
        const dto = new QuoteResponseDto();
        dto.id = quote.id;
        dto.customRequestId = quote.customRequestId;
        dto.providerId = quote.providerId;
        dto.price = parseFloat(quote.price.toString());
        dto.description = quote.description;
        dto.terms = quote.terms;
        dto.estimatedDuration = quote.estimatedDuration;
        dto.imageUrls = quote.imageUrls;
        dto.status = quote.status;
        dto.acceptedAt = quote.acceptedAt;
        dto.rejectedAt = quote.rejectedAt;
        dto.rejectionReason = quote.rejectionReason;
        dto.cancelledAt = quote.cancelledAt;
        dto.cancellationReason = quote.cancellationReason;
        dto.createdAt = quote.createdAt;
        dto.updatedAt = quote.updatedAt;
        return dto;
    }
}
