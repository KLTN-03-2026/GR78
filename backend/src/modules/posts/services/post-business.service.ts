import { Injectable, Logger } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { PostCustomer } from '../entities/post.entity';
import { CreatePostDto, UpdatePostDto } from '../dtos/post.dto';


@Injectable()
export class PostBusinessService {
    private readonly logger = new Logger(PostBusinessService.name);

    constructor(private readonly postRepository: PostRepository) {}

    async createPost(
        dto: CreatePostDto,
        customerId: string,
    ): Promise<PostCustomer | null> {
        const postData: Partial<PostCustomer> = {
            ...dto,
            customerId,
        };

        return await this.postRepository.createPost(postData);
    }


    async getPublicFeed(
        limit: number,
        cursor?: Date,
    ): Promise<{
        posts: PostCustomer[];
        hasMore: boolean;
        nextCursor: string | null;
    }> {
      
        const posts = await this.postRepository.findPublicPosts(limit + 1, cursor);

        const hasMore = posts.length > limit;
        const data = hasMore ? posts.slice(0, limit) : posts;

        const nextCursor =
            hasMore && data.length > 0
                ? data[data.length - 1].createdAt.toISOString()
                : null;

        return { posts: data, hasMore, nextCursor };
    }

    
    async updatePost(
        post: PostCustomer,
        dto: UpdatePostDto,
    ): Promise<PostCustomer> {
        const updateData: Partial<PostCustomer> = {
            ...dto,
            updatedAt: new Date(),
        };

        return await this.postRepository.updatePost(post.id, updateData);
    }


    async deletePost(postId: string): Promise<void> {
        await this.postRepository.softDelete(postId);
    }


    async closePost(post: PostCustomer): Promise<PostCustomer> {
        return await this.postRepository.closePost(post);
    }


    async getCustomerPosts(
        customerId: string,
        limit: number,
        cursor?: Date,
    ): Promise<{
        posts: PostCustomer[];
        hasMore: boolean;
        nextCursor: string | null;
    }> {
        const posts = await this.postRepository.findCustomerPosts(
            customerId,
            limit + 1,
            cursor,
        );

        const hasMore = posts.length > limit;
        const data = hasMore ? posts.slice(0, limit) : posts;

        const nextCursor =
            hasMore && data.length > 0
                ? data[data.length - 1].createdAt.toISOString()
                : null;

        return { posts: data, hasMore, nextCursor };
    }
}