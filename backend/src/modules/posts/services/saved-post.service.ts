import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
    DeleteSavedPostResponseDto,
    SavedPostResponseDto,
    SavedPostsListResponseDto,
} from '../dtos/saved-post.dto';
import { SavedPost } from '../entities/saved-post.entity';
import { PostRepository } from '../repositories/post.repository';
import { SavedPostRepository } from '../repositories/saved-post.repository';
import { PostCacheService } from './post-cache.service';

@Injectable()
export class SavedPostService {
    private readonly logger = new Logger(SavedPostService.name);

    constructor(
        private readonly savedPostRepository: SavedPostRepository,
        private readonly postRepository: PostRepository,
        private readonly cacheService: PostCacheService,
    ) { }


    async savePost(
        providerId: string,
        postId: string,
    ): Promise<SavedPostResponseDto> {
        this.logger.log(
            `Provider ${providerId} attempting to save post ${postId}`,
        );

        const post = await this.postRepository.findById(postId);
        if (!post) {
            this.logger.warn(`Post not found: ${postId}`);
            throw new NotFoundException(
                `Post with ID ${postId} not found`,
            );
        }

        const alreadySaved = await this.savedPostRepository.isSaved(
            providerId,
            postId,
        );
        if (alreadySaved) {
            this.logger.warn(
                `Post ${postId} already saved by provider ${providerId}`,
            );
            throw new ConflictException(
                'This post is already saved to your collection',
            );
        }

        const savedPost = await this.savedPostRepository.savePost(
            providerId,
            postId,
        );

        if (!savedPost) {
            throw new Error('Failed to save post');
        }

        this.logger.log(`Post ${postId} successfully saved by provider ${providerId}`);

        await this.cacheService.invalidateOnSavedChange(providerId, postId);

        return this.mapToResponseDto(savedPost);
    }


    async getSavedPosts(
        providerId: string,
        limit: number = 10,
        cursor?: string,
    ): Promise<SavedPostsListResponseDto> {
        const t0 = Date.now();

        const cacheKey = this.cacheService.keySavedList(providerId, limit, cursor);
        const hit = await this.cacheService.get<SavedPostsListResponseDto>(cacheKey);
        if (hit) {
            this.logger.debug(
                `[saved-list] cache hit providerId=${providerId} limit=${limit} took=${Date.now() - t0}ms`,
            );
            return hit;
        }

        this.logger.log(
            `Fetching saved posts for provider ${providerId} - limit: ${limit}, cursor: ${cursor}`,
        );

        const parsedCursor = this.parseCursor(cursor);

        const { posts, hasMore, nextCursor } =
            await this.savedPostRepository.findSavedPostsByProvider(
                providerId,
                limit,
                parsedCursor,
            );

        const result: SavedPostsListResponseDto = {
            data: posts.map(savedPost => this.mapToResponseDto(savedPost)),
            nextCursor,
            total: posts.length,
            hasMore,
        };

        await this.cacheService.set(cacheKey, result, this.cacheService.ttl.SAVED_LIST);

        return result;
    }


    async isSaved(providerId: string, postId: string): Promise<boolean> {
        const cacheKey = this.cacheService.keySavedCheck(providerId, postId);
        const hit = await this.cacheService.get<boolean>(cacheKey);
        if (hit !== null) {
            return hit;
        }

        const saved = await this.savedPostRepository.isSaved(providerId, postId);
        await this.cacheService.set(cacheKey, saved, this.cacheService.ttl.SAVED_CHECK);

        return saved;
    }


    async unsavePost(
        providerId: string,
        postId: string,
    ): Promise<DeleteSavedPostResponseDto> {
        this.logger.log(
            `Provider ${providerId} attempting to unsave post ${postId}`,
        );

        const savedPost = await this.savedPostRepository.findByProviderAndPost(
            providerId,
            postId,
        );

        if (!savedPost) {
            this.logger.warn(
                `Saved post not found for provider ${providerId} and post ${postId}`,
            );
            throw new NotFoundException(
                'This post is not in your saved collection',
            );
        }

        const deleted = await this.savedPostRepository.unsavePost(
            providerId,
            postId,
        );

        if (!deleted) {
            throw new Error('Failed to unsave post');
        }

        this.logger.log(`Post ${postId} successfully unsaved by provider ${providerId}`);

        await this.cacheService.invalidateOnSavedChange(providerId, postId);

        return {
            postId,
            success: true,
            message: 'Post has been removed from your saved posts',
        };
    }


    async unsavePostById(
        savedPostId: string,
        providerId: string,
    ): Promise<DeleteSavedPostResponseDto> {
        this.logger.log(
            `Provider ${providerId} attempting to delete saved post ${savedPostId}`,
        );

        const savedPost = await this.savedPostRepository.findById(savedPostId);

        if (!savedPost) {
            throw new NotFoundException(
                'Saved post not found',
            );
        }

        if (savedPost.providerId !== providerId) {
            throw new NotFoundException(
                'This post is not in your saved collection',
            );
        }

        const postId = savedPost.postId;
        const deleted = await this.savedPostRepository.deleteById(savedPostId);

        if (!deleted) {
            throw new Error('Failed to unsave post');
        }

        this.logger.log(`Saved post ${savedPostId} successfully deleted`);

        await this.cacheService.invalidateOnSavedChange(providerId, postId);

        return {
            postId,
            success: true,
            message: 'Post has been removed from your saved posts',
        };
    }


    async countSavedPosts(providerId: string): Promise<number> {
        const cacheKey = this.cacheService.keySavedCount(providerId);
        const hit = await this.cacheService.get<number>(cacheKey);
        if (hit !== null) {
            return hit;
        }

        const count = await this.savedPostRepository.countByProvider(providerId);
        await this.cacheService.set(cacheKey, count, this.cacheService.ttl.SAVED_COUNT);

        return count;
    }


    private mapToResponseDto(savedPost: SavedPost): SavedPostResponseDto {
        return plainToInstance(SavedPostResponseDto, savedPost, {
            excludeExtraneousValues: true,
        });
    }


    private parseCursor(cursor?: string): Date | undefined {
        if (!cursor) return undefined;

        try {
            const date = new Date(cursor);
            if (isNaN(date.getTime())) {
                this.logger.warn(`Invalid cursor format: ${cursor}`);
                return undefined;
            }
            return date;
        } catch (error) {
            this.logger.warn(`Error parsing cursor: ${cursor}`, error);
            return undefined;
        }
    }
}
