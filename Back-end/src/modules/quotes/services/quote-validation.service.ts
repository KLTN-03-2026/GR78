import { PostCustomer } from '@/modules/posts/entities/post.entity';
import { PostRepository } from '@/modules/posts/repositories/post.repository';
import { User } from '@/modules/users/entities/user.entity';
import { UserRepository } from '@/modules/users/repositorys/user.repository';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
import { Quote } from '../entities/quote.entity';
import { QuoteStatus } from '../enums/quote-status.enum';
import { QuoteRepository } from '../repositories/quote.repository';



@Injectable()
export class QuoteValidationService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly postRepo: PostRepository,
        private readonly quoteRepo: QuoteRepository,
    ) { }


    async validateProvider(providerId: string): Promise<User> {
        const provider = await this.userRepo.findByIdProvider(providerId);

        if (!provider) {
            throw new ForbiddenException('Only workers can create bids');
        }

        return provider;
    }


    async validatePostForQuote(
        postId: string,
        providerId: string,
    ): Promise<PostCustomer> {
        const post = await this.postRepo.findById(postId);

        if (!post) {
            throw new NotFoundException('Not found post');
        }

        if (!post.isOpen()) {
            throw new BadRequestException(
                'Post is closed, no bidding possible',
            );
        }


        const existingQuote = await this.quoteRepo.findOne({
            where: {
                postId,
                providerId,
                deletedAt: IsNull(),
                status: Not(QuoteStatus.CANCELLED),
            },
        });

        if (existingQuote) {
            throw new ConflictException(
                'You have already bid on this post',
            );
        }

        return post;
    }


    validatePrice(price: number, postBudget?: number): void {
        if (price <= 0) {
            throw new BadRequestException('Price must be greater than 0');
        }

        if (postBudget && price > postBudget * 1.5) {
            throw new BadRequestException(
                'The offer price exceeded 150% of the customer is budget',
            );
        }
    }


    validateQuoteOwnership(quote: Quote, providerId: string): void {
        if (!quote.belongsTo(providerId)) {
            throw new ForbiddenException(
                'You do not have permission to perform this action',
            );
        }
    }


    validatePostOwnership(post: PostCustomer, customerId: string): void {
        if (!post.belongsTo(customerId)) {
            throw new ForbiddenException(
                'You do not have permission to perform this action.',
            );
        }
    }


    validateQuoteCanEdit(quote: Quote): void {
        if (!quote.canEdit()) {
            throw new BadRequestException(
                'Cannot edit a quote that has been processed or deleted',
            );
        }
    }


    validateQuoteCanCancel(quote: Quote): void {
        if (!quote.canCancel()) {
            throw new BadRequestException('This quote cannot be canceled.');
        }
    }


    validateQuoteIsPending(quote: Quote): void {
        if (!quote.isPending()) {
            throw new BadRequestException(
                'Quote is not pending',
            );
        }
    }


    validatePostIsOpen(post: PostCustomer): void {
        if (!post.isOpen()) {
            throw new BadRequestException('Post closed');
        }
    }


    validateQuoteAccess(quote: Quote, userId: string): void {
        const isOwner = quote.belongsTo(userId);
        const isPostOwner = quote.post.belongsTo(userId);

        if (!isOwner && !isPostOwner) {
            throw new ForbiddenException(
                'You do not have permission to view this quote',
            );
        }
    }



}