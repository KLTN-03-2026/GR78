import { NotificationService } from '@/modules/notifications/notification.service';
import { Order } from '@/modules/orders/entities/order.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddReplyDto, CreateReviewDto, GetReviewsQueryDto, ReviewListResponseDto, ReviewResponseDto } from './dtos/review.dto';
import { Review } from './entities/review.entity';
import { ReviewRepository } from './repositories/review.repository';

@Injectable()
export class ReviewService {
    private readonly logger = new Logger(ReviewService.name);

    constructor(
        private readonly reviewRepo: ReviewRepository,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(Profile)
        private readonly profileRepo: Repository<Profile>,
        private readonly notificationService: NotificationService,
    ) {}

    async createReview(customerId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
        const order = await this.orderRepo.findOne({
            where: { id: dto.orderId },
            relations: ['provider', 'provider.profile', 'customer', 'customer.profile'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.belongsToCustomer(customerId)) {
            throw new ForbiddenException('Only the customer of this order can leave a review');
        }

        if (!order.isCompleted()) {
            throw new BadRequestException('Reviews can only be submitted for COMPLETED orders');
        }

        const alreadyReviewed = await this.reviewRepo.existsByOrderId(dto.orderId);
        if (alreadyReviewed) {
            throw new ConflictException('A review for this order already exists');
        }

        const review = this.reviewRepo.create({
            orderId: dto.orderId,
            reviewerId: customerId,
            revieweeId: order.providerId,
            rating: dto.rating,
            comment: dto.comment,
            isPublic: dto.isPublic ?? true,
        });

        const saved = await this.reviewRepo.save(review);

        await this.updateProviderRating(order.providerId);

        const customerName =
            order.customer?.profile?.fullName ||
            order.customer?.profile?.displayName ||
            'Khách hàng';

        try {
            await this.notificationService.notifyNewReview(
                order.providerId,
                saved.id,
                saved.rating,
                customerName,
            );
        } catch (err) {
            this.logger.error(`Failed to send review notification for review ${saved.id}: ${err}`);
        }

        this.logger.log(`Review created: ${saved.id} for order ${dto.orderId}`);
        return this.toResponseDto(saved, order);
    }

    async addProviderReply(
        reviewId: string,
        providerId: string,
        dto: AddReplyDto,
    ): Promise<ReviewResponseDto> {
        const review = await this.reviewRepo.findById(reviewId);

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        if (review.revieweeId !== providerId) {
            throw new ForbiddenException('Only the reviewed provider can reply');
        }

        if (review.providerReply) {
            throw new BadRequestException('A reply has already been submitted for this review');
        }

        review.providerReply = dto.reply;
        review.repliedAt = new Date();

        const saved = await this.reviewRepo.save(review);

        const providerName =
            review.reviewee?.profile?.fullName ||
            review.reviewee?.profile?.displayName ||
            'Thợ';

        try {
            await this.notificationService.notifyReviewReply(
                review.reviewerId,
                saved.id,
                providerName,
            );
        } catch (err) {
            this.logger.error(`Failed to send reply notification for review ${reviewId}: ${err}`);
        }

        this.logger.log(`Provider reply added to review ${reviewId}`);
        return this.toResponseDto(saved);
    }

    async getProviderReviews(
        providerId: string,
        query: GetReviewsQueryDto,
    ): Promise<ReviewListResponseDto> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        const { data, total, averageRating } = await this.reviewRepo.findByReviewee(
            providerId,
            page,
            limit,
        );

        return {
            data: data.map((r) => this.toResponseDto(r)),
            total,
            page,
            limit,
            hasMore: page * limit < total,
            averageRating: Math.round(averageRating * 100) / 100,
        };
    }

    async getMyReviews(
        userId: string,
        query: GetReviewsQueryDto,
    ): Promise<ReviewListResponseDto> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        const { data, total } = await this.reviewRepo.findByReviewer(userId, page, limit);

        return {
            data: data.map((r) => this.toResponseDto(r)),
            total,
            page,
            limit,
            hasMore: page * limit < total,
        };
    }

    async getOrderReview(orderId: string, userId: string): Promise<ReviewResponseDto> {
        const review = await this.reviewRepo.findByOrderId(orderId);

        if (!review) {
            throw new NotFoundException('No review found for this order');
        }

        if (review.reviewerId !== userId && review.revieweeId !== userId) {
            throw new ForbiddenException('You do not have access to this review');
        }

        return this.toResponseDto(review);
    }

    private async updateProviderRating(providerId: string): Promise<void> {
        const { data: allReviews, averageRating } = await this.reviewRepo.findByReviewee(
            providerId,
            1,
            Number.MAX_SAFE_INTEGER,
        );

        await this.profileRepo.update(
            { userId: providerId },
            {
                averageRating: Math.round(averageRating * 100) / 100,
                reviewCount: allReviews.length,
            },
        );
    }

    private toResponseDto(review: Review, order?: Order): ReviewResponseDto {
        const dto = new ReviewResponseDto();
        dto.id = review.id;
        dto.orderId = review.orderId;
        dto.reviewerId = review.reviewerId;
        dto.revieweeId = review.revieweeId;
        dto.rating = review.rating;
        dto.comment = review.comment;
        dto.isPublic = review.isPublic;
        dto.providerReply = review.providerReply;
        dto.repliedAt = review.repliedAt;
        dto.createdAt = review.createdAt;
        dto.updatedAt = review.updatedAt;

        const reviewerSource = review.reviewer ?? order?.customer;
        if (reviewerSource) {
            dto.reviewer = {
                id: reviewerSource.id,
                fullName: (reviewerSource as any).profile?.fullName,
                displayName: (reviewerSource as any).profile?.displayName,
                avatarUrl: (reviewerSource as any).profile?.avatarUrl,
            };
        }

        const revieweeSource = review.reviewee ?? order?.provider;
        if (revieweeSource) {
            dto.reviewee = {
                id: revieweeSource.id,
                fullName: (revieweeSource as any).profile?.fullName,
                displayName: (revieweeSource as any).profile?.displayName,
                avatarUrl: (revieweeSource as any).profile?.avatarUrl,
            };
        }

        return dto;
    }
}
