import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
    Body,
    Controller,
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
    AddReplyDto,
    CreateReviewDto,
    GetReviewsQueryDto,
    ReviewListResponseDto,
    ReviewResponseDto,
} from './dtos/review.dto';
import { ReviewService } from './review.service';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Post()
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: '[Customer] Đánh giá thợ sau khi đơn hàng hoàn thành',
        description:
            'Khách hàng gửi đánh giá (rating 1–5) cho thợ sau khi đơn hàng ở trạng thái COMPLETED. ' +
            'Mỗi đơn hàng chỉ được đánh giá một lần.',
    })
    @ApiResponse({ status: 201, description: 'Review created', type: ReviewResponseDto })
    @ApiResponse({ status: 400, description: 'Order not completed or validation failed' })
    @ApiResponse({ status: 403, description: 'Not the customer of this order' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 409, description: 'Review already exists for this order' })
    async createReview(
        @CurrentUserId('id') customerId: string,
        @Body() dto: CreateReviewDto,
    ): Promise<ReviewResponseDto> {
        return await this.reviewService.createReview(customerId, dto);
    }

    @Post(':id/reply')
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[Provider] Phản hồi đánh giá của khách hàng',
        description: 'Thợ phản hồi một lần cho đánh giá mà khách đã gửi. Không thể sửa lại sau khi đã phản hồi.',
    })
    @ApiResponse({ status: 200, description: 'Reply added', type: ReviewResponseDto })
    @ApiResponse({ status: 400, description: 'Reply already exists' })
    @ApiResponse({ status: 403, description: 'Not the reviewed provider' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    async addReply(
        @Param('id', ParseUUIDPipe) reviewId: string,
        @CurrentUserId('id') providerId: string,
        @Body() dto: AddReplyDto,
    ): Promise<ReviewResponseDto> {
        return await this.reviewService.addProviderReply(reviewId, providerId, dto);
    }

    @Get('provider/:providerId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Xem đánh giá của một thợ',
        description: 'Lấy danh sách đánh giá công khai của một thợ, kèm điểm trung bình.',
    })
    @ApiResponse({ status: 200, description: 'Success', type: ReviewListResponseDto })
    async getProviderReviews(
        @Param('providerId', ParseUUIDPipe) providerId: string,
        @Query() query: GetReviewsQueryDto,
    ): Promise<ReviewListResponseDto> {
        return await this.reviewService.getProviderReviews(providerId, query);
    }

    @Get('order/:orderId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Xem đánh giá của một đơn hàng',
        description: 'Cả khách hàng và thợ trong đơn hàng đều có thể xem đánh giá.',
    })
    @ApiResponse({ status: 200, description: 'Success', type: ReviewResponseDto })
    @ApiResponse({ status: 403, description: 'No access' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    async getOrderReview(
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<ReviewResponseDto> {
        return await this.reviewService.getOrderReview(orderId, user.id);
    }

    @Get('my')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Xem đánh giá của tôi',
        description: 'Khách hàng xem các đánh giá mình đã gửi.',
    })
    @ApiResponse({ status: 200, description: 'Success', type: ReviewListResponseDto })
    async getMyReviews(
        @CurrentUser() user: JwtPayload,
        @Query() query: GetReviewsQueryDto,
    ): Promise<ReviewListResponseDto> {
        return await this.reviewService.getMyReviews(user.id, query);
    }
}
