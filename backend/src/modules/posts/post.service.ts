import { UploadService } from '@/common/upload/upload.service';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { UserRepository } from '@/modules/users/repositorys/user.repository';

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
    ) { }

    async createWithFiles(
        dto: CreatePostDto,
        files: Express.Multer.File[],
        jwtUser: JwtPayload,
        context?: ModerationContext,
    ): Promise<PostResponseDto> {
        // 1. upload ảnh
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
        return this.mapperService.toResponseDto(post!);
    }


    async getFeed(limit = 10, cursor?: string): Promise<FeedResponseDto> {
        this.logger.log(`Fetching public feed - limit: ${limit}, cursor: ${cursor}`);

        const parsedCursor = this.validationService.validateAndParseCursor(cursor);

        const { posts, hasMore, nextCursor } =
            await this.businessService.getPublicFeed(limit, parsedCursor);

        return {
            data: posts.map(post => this.mapperService.toResponseDto(post)),
            nextCursor,
            total: posts.length,
            hasMore,
        };
    }


    async getById(id: string): Promise<PostResponseDto> {
        this.logger.log(`Fetching post by ID: ${id}`);

        const post = await this.validationService.validatePostExists(id);

        return this.mapperService.toResponseDto(post);
    }


    async update(
        id: string,
        dto: UpdatePostDto,
        jwtUser: JwtPayload,

        context?: ModerationContext,
    ): Promise<PostResponseDto> {
        this.logger.log(`Updating post: ${id} by user: ${jwtUser.id}`);

        const post = await this.validationService.validatePostOwnership(
            id,
        );

        this.validationService.validatePostUpdateRules(post, dto);

        await this.validationService.validateAndModeratePostUpdate(
            post,
            dto,
            jwtUser.id,
            context,
        );

        const updatedPost = await this.businessService.updatePost(post, dto);

        this.logger.log(`Post updated successfully: ${updatedPost.id}`);
        return this.mapperService.toResponseDto(updatedPost);
    }


    async delete(
        id: string,
        jwtUser: JwtPayload,
    ): Promise<DeletePostResponseDto> {
        this.logger.log(`Deleting post: ${id} by user: ${jwtUser.id}`);

        await this.validationService.validatePostOwnership(id);

        await this.businessService.deletePost(id);

        this.logger.log(`Post deleted successfully: ${id}`);
        return {
            success: true,
            message: 'Post deleted successfully',
            postId: id,
        };
    }


    async close(id: string, jwtUser: JwtPayload): Promise<PostResponseDto> {
        this.logger.log(`Closing post: ${id} by user: ${jwtUser.id}`);

        const post = await this.validationService.validatePostOwnership(
            id,

        );
        this.validationService.validatePostNotClosed(post);


        const closedPost = await this.businessService.closePost(post);

        this.logger.log(`Post closed successfully: ${closedPost.id}`);
        return this.mapperService.toResponseDto(closedPost);
    }


    async getMyPosts(
        jwtUser: JwtPayload,
        limit = 10,
        cursor?: string,
    ): Promise<FeedResponseDto> {
        this.logger.log(`Fetching posts for user: ${jwtUser.id}`);

        const parsedCursor = this.validationService.validateAndParseCursor(cursor);

        const { posts, hasMore, nextCursor } =
            await this.businessService.getCustomerPosts(
                jwtUser.id,
                limit,
                parsedCursor,
            );

        return {
            data: posts.map(post => this.mapperService.toResponseDto(post)),
            nextCursor,
            total: posts.length,
            hasMore,
        };
    }




    async createPost(providerId: string,
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
        return this.mapperService.toResponseDto(post!);
    }
}