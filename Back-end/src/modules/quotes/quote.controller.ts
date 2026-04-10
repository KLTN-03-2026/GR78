import { Roles } from '@/common/decorators/@Roles';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
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
import { CurrentUserId } from '../../common/decorators/@CurrentUserId';
import {
    CancelQuoteDto,
    CreateQuoteDto,
    QuoteResponseDto,
    RejectQuoteDto,
    ReviseQuoteDto,
    UpdateQuoteDto
} from './dtos/quote.dto';
import { QuoteService } from './quote.service';

@ApiTags('Quotes')
@Controller('quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuoteController {
    constructor(private readonly quoteService: QuoteService) { }


    @Post()
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: '[Provider] Tạo quote mới cho post',
        description: 'Provider chào giá lần đầu cho một post của customer'
    })
    @ApiResponse({ status: 201, description: 'Quote created successfully' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @ApiResponse({ status: 409, description: 'Already quoted this post' })
    async createQuote(
        @CurrentUserId('id') providerId: string,
        @Body() dto: CreateQuoteDto,
    ) {
        return await this.quoteService.createQuote(providerId, dto);
    }

    @Post(':id/revise')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Chào giá lại trong chat',
        description: 'Provider thay đổi giá sau khi chat đã mở. Tạo revision mới.'
    })
    @ApiResponse({ status: 200, description: 'Quote revised successfully' })
    @ApiResponse({ status: 400, description: 'Cannot revise at current status' })
    async reviseQuote(
        @Param('id') quoteId: string,
        @CurrentUserId('id') providerId: string,
        @Body() dto: ReviseQuoteDto,
    ) {
        return await this.quoteService.reviseQuote(quoteId, providerId, dto);
    }

    @Patch(':id')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Sửa quote (chỉ khi PENDING)',
        description: 'Chỉ có thể sửa khi quote chưa được accept. Không tạo revision mới.'
    })
    @ApiResponse({ status: 200, description: 'Quote updated successfully' })
    @ApiResponse({ status: 400, description: 'Cannot edit accepted quote' })
    async updateQuote(
        @Param('id') quoteId: string,
        @CurrentUserId('id') providerId: string,
        @Body() dto: UpdateQuoteDto,
    ) {
        return await this.quoteService.updateQuote(quoteId, providerId, dto);
    }

    @Post(':id/cancel')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Hủy quote',
        description: 'Provider hủy quote. Có thể hủy trước khi order được tạo.'
    })
    @ApiResponse({ status: 200, description: 'Quote cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Cannot cancel' })
    async cancelQuote(
        @Param('id') quoteId: string,
        @CurrentUserId('id') providerId: string,
        @Body() dto: CancelQuoteDto,
    ) {
        return await this.quoteService.cancelQuote(
            quoteId,
            providerId,
            dto.reason,
        );
    }

    @Delete(':id')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Xóa quote',
        description: 'Soft delete quote. Chỉ có thể xóa khi chưa có order.'
    })
    @ApiResponse({ status: 200, description: 'Quote deleted successfully' })
    async deleteQuote(
        @Param('id') quoteId: string,
        @CurrentUserId('id') providerId: string,
    ) {
        await this.quoteService.deleteQuote(quoteId, providerId);
        return { success: true, message: 'Quote deleted' };
    }

    @Get('my-quotes')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Lấy danh sách quote của tôi',
        description: 'Xem tất cả quotes đã tạo, có thể filter theo status'
    })
    @ApiResponse({ status: 200, description: 'Success' })
    async getMyQuotes(
        @CurrentUserId('id') providerId: string,
        @Query() query: QuoteResponseDto,
    ) {
        return await this.quoteService.getProviderQuotes(providerId, query.status);
    }


    @Post(':id/accept-for-chat')
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Customer] Chấp nhận quote để mở chat',
        description: 'Customer chấp nhận quote, mở conversation để thương lượng. KHÔNG tạo order ngay.'
    })
    @ApiResponse({ status: 200, description: 'Chat opened successfully' })
    @ApiResponse({ status: 400, description: 'Cannot accept quote' })
    async acceptQuoteForChat(
        @Param('id') quoteId: string,
        @CurrentUserId('id') customerId: string,
    ) {
        return await this.quoteService.acceptQuoteForChat(quoteId, customerId);
    }

    @Post(':id/request-order')
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Customer] Nhấn đặt đơn với revision cụ thể',
        description: 'Customer chọn một revision (hoặc revision hiện tại) để tạo order. Provider cần confirm.'
    })
    @ApiResponse({ status: 200, description: 'Order requested successfully' })
    @ApiResponse({ status: 400, description: 'Cannot request order' })
    async requestOrderFromRevision(
        @Param('id') quoteId: string,
        @CurrentUserId('id') customerId: string,
        @Body() dto: CreateQuoteDto,
    ) {
        return await this.quoteService.reviseQuote(
            quoteId,
            customerId,
            dto,
        );
    }

    @Post(':id/reject')
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Customer] Từ chối quote',
        description: 'Customer từ chối quote khi còn PENDING'
    })
    @ApiResponse({ status: 200, description: 'Quote rejected successfully' })
    async rejectQuote(
        @Param('id') quoteId: string,
        @CurrentUserId('id') customerId: string,
        @Body() dto: RejectQuoteDto,
    ) {
        return await this.quoteService.rejectQuote(
            quoteId,
            customerId,
            dto.reason,
        );
    }

    @Get('post/:postId')
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Customer] Lấy tất cả quote của một post',
        description: 'Xem tất cả quotes cho post của mình'
    })
    @ApiResponse({ status: 200, description: 'Success' })
    async getPostQuotes(
        @Param('postId') postId: string,
        @CurrentUserId('id') customerId: string,
    ) {
        return await this.quoteService.getPostQuotes(postId, customerId);
    }


    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Xem chi tiết quote',
        description: 'Lấy thông tin quote (không bao gồm revisions)'
    })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 403, description: 'No access' })
    async getQuoteById(
        @Param('id') quoteId: string,
        @CurrentUserId('id') userId: string,
    ) {
        return await this.quoteService.getQuoteById(quoteId, userId);
    }

    @Get(':id/with-revisions')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Xem quote với toàn bộ lịch sử revisions',
        description: 'Dùng cho chat để hiển thị lịch sử chào giá. Customer có thể chọn revision để tạo order.'
    })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 403, description: 'No access' })
    async getQuoteWithRevisions(
        @Param('id') quoteId: string,
        @CurrentUserId('id') userId: string,
    ) {
        return await this.quoteService.getQuoteRevisionHistory(quoteId, userId);
    }
}