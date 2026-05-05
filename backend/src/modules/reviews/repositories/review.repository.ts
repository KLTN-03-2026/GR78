import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewRepository {
    constructor(
        @InjectRepository(Review)
        private readonly repository: Repository<Review>,
    ) {}

    create(data: Partial<Review>): Review {
        return this.repository.create(data);
    }

    async save(review: Review): Promise<Review> {
        return await this.repository.save(review);
    }

    async findById(id: string): Promise<Review | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['reviewer', 'reviewer.profile', 'reviewee', 'reviewee.profile'],
        });
    }

    async findByOrderId(orderId: string): Promise<Review | null> {
        return await this.repository.findOne({
            where: { orderId },
            relations: ['reviewer', 'reviewer.profile', 'reviewee', 'reviewee.profile'],
        });
    }

    async findByReviewee(
        revieweeId: string,
        page: number,
        limit: number,
    ): Promise<{ data: Review[]; total: number; averageRating: number }> {
        const [data, total] = await this.repository.findAndCount({
            where: { revieweeId, isPublic: true },
            relations: ['reviewer', 'reviewer.profile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const ratingResult = await this.repository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'avg')
            .where('review.reviewee_id = :revieweeId', { revieweeId })
            .andWhere('review.is_public = true')
            .getRawOne();

        const averageRating = ratingResult?.avg ? parseFloat(ratingResult.avg) : 0;

        return { data, total, averageRating };
    }

    async findByReviewer(
        reviewerId: string,
        page: number,
        limit: number,
    ): Promise<{ data: Review[]; total: number }> {
        const [data, total] = await this.repository.findAndCount({
            where: { reviewerId },
            relations: ['reviewee', 'reviewee.profile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { data, total };
    }

    async existsByOrderId(orderId: string): Promise<boolean> {
        return await this.repository.exists({ where: { orderId } });
    }
}
