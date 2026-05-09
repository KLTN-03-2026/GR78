import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SavedPost } from '../entities/saved-post.entity';

@Injectable()
export class SavedPostRepository {
    private readonly logger = new Logger(SavedPostRepository.name);

    constructor(
        @InjectRepository(SavedPost)
        private readonly repository: Repository<SavedPost>,
    ) { }

    private getRepository(manager?: EntityManager): Repository<SavedPost> {
        return manager ? manager.getRepository(SavedPost) : this.repository;
    }

    
    async savePost(
        providerId: string,
        postId: string,
        manager?: EntityManager,
    ): Promise<SavedPost | null> {
        const repo = this.getRepository(manager);

        const existingSave = await repo.findOne({
            where: { providerId, postId },
        });

        if (existingSave) {
            this.logger.warn(
                `Post ${postId} already saved by provider ${providerId}`,
            );
            return existingSave;
        }

        const savedPost = repo.create({
            providerId,
            postId,
        });

        const saved = await repo.save(savedPost);
        this.logger.log(
            `Post ${postId} saved by provider ${providerId}: ${saved.id}`,
        );

        return await this.findById(saved.id, manager);
    }

    
    async findById(id: string, manager?: EntityManager): Promise<SavedPost | null> {
        return this.getRepository(manager).findOne({
            where: { id },
            relations: {
                provider: {
                    profile: true,
                },
                post: {
                    customer: {
                        profile: true,
                    },
                },
            },
        });
    }

    
    async findByProviderAndPost(
        providerId: string,
        postId: string,
        manager?: EntityManager,
    ): Promise<SavedPost | null> {
        return this.getRepository(manager).findOne({
            where: { providerId, postId },
            relations: {
                post: {
                    customer: {
                        profile: true,
                    },
                },
            },
        });
    }

    
    async isSaved(
        providerId: string,
        postId: string,
        manager?: EntityManager,
    ): Promise<boolean> {
        const count = await this.getRepository(manager).count({
            where: { providerId, postId },
        });
        return count > 0;
    }

    
    async findSavedPostsByProvider(
        providerId: string,
        limit: number = 10,
        cursor?: Date,
        manager?: EntityManager,
    ): Promise<{
        posts: SavedPost[];
        hasMore: boolean;
        nextCursor?: string;
    }> {
        const repo = this.getRepository(manager);

        const query = repo
            .createQueryBuilder('saved')
            .leftJoinAndSelect('saved.post', 'post')
            .leftJoinAndSelect('post.customer', 'customer')
            .leftJoinAndSelect('customer.profile', 'profile')
            .where('saved.providerId = :providerId', { providerId })
            .orderBy('saved.createdAt', 'DESC');

        if (cursor) {
            query.andWhere('saved.createdAt < :cursor', { cursor });
        }

        // Fetch limit + 1 to check if there are more results
        const posts = await query.take(limit + 1).getMany();

        const hasMore = posts.length > limit;
        if (hasMore) {
            posts.pop(); // Remove the extra item
        }

        const nextCursor =
            hasMore && posts.length > 0
                ? posts[posts.length - 1].createdAt.toISOString()
                : undefined;

        this.logger.log(
            `Fetched ${posts.length} saved posts for provider ${providerId}`,
        );

        return { posts, hasMore, nextCursor };
    }

    
    async unsavePost(
        providerId: string,
        postId: string,
        manager?: EntityManager,
    ): Promise<boolean> {
        const repo = this.getRepository(manager);
        const result = await repo.delete({
            providerId,
            postId,
        });

        const deleted = (result.affected || 0) > 0;
        if (deleted) {
            this.logger.log(
                `Post ${postId} unsaved by provider ${providerId}`,
            );
        } else {
            this.logger.warn(
                `No saved post found for provider ${providerId} and post ${postId}`,
            );
        }

        return deleted;
    }

    
    async deleteById(
        id: string,
        manager?: EntityManager,
    ): Promise<boolean> {
        const repo = this.getRepository(manager);
        const result = await repo.delete({ id });
        return (result.affected || 0) > 0;
    }

    
    async countByProvider(
        providerId: string,
        manager?: EntityManager,
    ): Promise<number> {
        return this.getRepository(manager).count({
            where: { providerId },
        });
    }

    
    async deleteAllByProvider(
        providerId: string,
        manager?: EntityManager,
    ): Promise<number> {
        const repo = this.getRepository(manager);
        const result = await repo.delete({ providerId });
        const count = result.affected || 0;
        this.logger.log(`Deleted ${count} saved posts for provider ${providerId}`);
        return count;
    }
}
