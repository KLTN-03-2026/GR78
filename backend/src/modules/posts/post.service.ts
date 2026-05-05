import { UploadService } from '@/common/upload/upload.service';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { Injectable, Logger } from '@nestjs/common';
import {
    CreatePostDto,
    DeletePostResponseDto,
    FeedResponseDto,
    PostResponseDto,
    UpdatePostDto,
} from './dtos/post.dto';
import { PostRepository } from './repositories/post.repository';
import { PostBusinessService } from './services/post-business.service';
import { PostCacheService } from './services/post-cache.service';
import { PostMapperService } from './services/post-mapper.service';
import { ModerationContext, PostValidationService } from './services/post-validation.service';


@Injectable()
export class PostService {
    private readonly logger = new Logger(PostService.name);

    constructor(
        private readonly postRepository: PostRepository,
        private readonly userRepository: UserRepository,
        private readonly validationService: PostValidationService,
        private readonly mapperService: PostMapperService,
        private readonly businessService: PostBusinessService,
        private readonly uploadService: UploadService,
        private readonly cacheService: PostCacheService,
    ) { }

    async createWithFiles(
        dto: CreatePostDto,
        files: Express.Multer.File[],
        jwtUser: JwtPayload,
        context?: ModerationContext,
    ): Promise<PostResponseDto> {
        if (files?.length > 0) {
            const { succeeded, failed } = await this.uploadService.uploadMultiple(files, 'posts');

            if (failed.length > 0) {
                this.logger.warn(
                    `Some images failed to upload: ${failed.map(f => f.originalName).join(', ')}`,
                );
            }

            dto.imageUrls = succeeded.map(r => r.publicUrl);
        }

        return this.create(dto, jwtUser, context);
    }

    async create(
        dto: CreatePostDto,
        jwtUser: JwtPayload,
        context?: ModerationContext,
    ): Promise<PostResponseDto> {
        this.logger.log(`Creating post for user: ${jwtUser.id}`);

        await this.validationService.validateUserExists(jwtUser.id);

        await this.validationService.validateAndModeratePostContent(
            dto,
            jwtUser.id,
            context,
        );

        const post = await this.businessService.createPost(dto, jwtUser.id);

        this.logger.log(`Post created successfully: ${post!.id}`);

        await this.cacheService.invalidateOnPostCreate(jwtUser.id);

        return this.mapperService.toResponseDto(post!);
    }


    async getFeed(limit = 10, cursor?: string): Promise<FeedResponseDto> {
        const t0 = Date.now();

        const cacheKey = this.cacheService.keyFeed(limit, cursor);
        const hit = await this.cacheService.get<FeedResponseDto>(cacheKey);
        if (hit) {
            this.logger.debug(
                `[feed] cache hit cursor=${cursor ?? '-'} limit=${limit} took=${Date.now() - t0}ms`,
            );
            return hit;
        }

        this.logger.log(`Fetching public feed - limit: ${limit}, cursor: ${cursor}`);

        const parsedCursor = this.validationService.validateAndParseCursor(cursor);

        const { posts, hasMore, nextCursor } =
            await this.businessService.getPublicFeed(limit, parsedCursor);

        const result: FeedResponseDto = {
            data: posts.map(post => this.mapperService.toResponseDto(post)),
            nextCursor,
            total: posts.length,
            hasMore,
        };

        await this.cacheService.set(cacheKey, result, this.cacheService.ttl.FEED);

        return result;
    }


    async getById(id: string): Promise<PostResponseDto> {
        const cacheKey = this.cacheService.keyPost(id);
        const hit = await this.cacheService.get<PostResponseDto>(cacheKey);
        if (hit) {
            this.logger.debug(`[post] cache hit id=${id}`);
            return hit;
        }

        this.logger.log(`Fetching post by ID: ${id}`);

        const post = await this.validationService.validatePostExists(id);
        const result = this.mapperService.toResponseDto(post);

        await this.cacheService.set(cacheKey, result, this.cacheService.ttl.POST);

        return result;
    }


    async update(
        id: string,
        dto: UpdatePostDto,
        jwtUser: JwtPayload,
        context?: ModerationContext,
    ): Promise<PostResponseDto> {
        this.logger.log(`Updating post: ${id} by user: ${jwtUser.id}`);

        const post = await this.validationService.validatePostOwnership(id);

        this.validationService.validatePostUpdateRules(post, dto);

        await this.validationService.validateAndModeratePostUpdate(
            post,
            dto,
            jwtUser.id,
            context,
        );

        const updatedPost = await this.businessService.updatePost(post, dto);

        this.logger.log(`Post updated successfully: ${updatedPost.id}`);

        const result = this.mapperService.toResponseDto(updatedPost);

        await this.cacheService.invalidateOnPostWrite(id, post.customerId);

        return result;
    }


    async delete(
        id: string,
        jwtUser: JwtPayload,
    ): Promise<DeletePostResponseDto> {
        this.logger.log(`Deleting post: ${id} by user: ${jwtUser.id}`);

        const post = await this.validationService.validatePostOwnership(id);

        await this.businessService.deletePost(id);

        this.logger.log(`Post deleted successfully: ${id}`);

        await this.cacheService.invalidateOnPostWrite(id, post.customerId);

        return {
            success: true,
            message: 'Post deleted successfully',
            postId: id,
        };
    }


    async close(id: string, jwtUser: JwtPayload): Promise<PostResponseDto> {
        this.logger.log(`Closing post: ${id} by user: ${jwtUser.id}`);

        const post = await this.validationService.validatePostOwnership(id);
        this.validationService.validatePostNotClosed(post);

        const closedPost = await this.businessService.closePost(post);

        this.logger.log(`Post closed successfully: ${closedPost.id}`);

        const result = this.mapperService.toResponseDto(closedPost);

        await this.cacheService.invalidateOnPostWrite(id, post.customerId);

        return result;
    }


    async getMyPosts(
        jwtUser: JwtPayload,
        limit = 10,
        cursor?: string,
    ): Promise<FeedResponseDto> {
        const t0 = Date.now();

        const cacheKey = this.cacheService.keyMyPosts(jwtUser.id, limit, cursor);
        const hit = await this.cacheService.get<FeedResponseDto>(cacheKey);
        if (hit) {
            this.logger.debug(
                `[mine] cache hit userId=${jwtUser.id} limit=${limit} took=${Date.now() - t0}ms`,
            );
            return hit;
        }

        this.logger.log(`Fetching posts for user: ${jwtUser.id}`);

        const parsedCursor = this.validationService.validateAndParseCursor(cursor);

        const { posts, hasMore, nextCursor } =
            await this.businessService.getCustomerPosts(
                jwtUser.id,
                limit,
                parsedCursor,
            );

        const result: FeedResponseDto = {
            data: posts.map(post => this.mapperService.toResponseDto(post)),
            nextCursor,
            total: posts.length,
            hasMore,
        };

        await this.cacheService.set(cacheKey, result, this.cacheService.ttl.MY_POSTS);

        return result;
    }


    async createPost(
        providerId: string,
        jwtUser: JwtPayload,
        dto: CreatePostDto,
        context?: ModerationContext,
    ): Promise<PostResponseDto> {
        this.logger.log(`Creating post for user to provider: ${jwtUser.id}`);

        await this.validationService.validateUserExists(jwtUser.id);

        await this.validationService.validateAndModeratePostContent(
            dto,
            jwtUser.id,
            context,
        );

        const post = await this.businessService.createPost(dto, jwtUser.id);

        this.logger.log(`Post created successfully: ${post!.id}`);

        await this.cacheService.invalidateOnPostCreate(jwtUser.id);

        return this.mapperService.toResponseDto(post!);
    }
}
