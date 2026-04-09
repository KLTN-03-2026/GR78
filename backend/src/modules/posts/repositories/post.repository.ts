import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { PostCustomer } from '../entities/post.entity';
import { PostStatus } from '../enums/post-status.enum';


@Injectable()
export class PostRepository {
    private readonly logger = new Logger(PostRepository.name);

    constructor(
        @InjectRepository(PostCustomer)
        private readonly repository: Repository<PostCustomer>,
    ) { }


    private getRepository(manager?: EntityManager): Repository<PostCustomer> {
        return manager ? manager.getRepository(PostCustomer) : this.repository;
    }


    async createPost(
        data: Partial<PostCustomer>,
        manager?: EntityManager,
    ): Promise<PostCustomer | null> {
        const repo = this.getRepository(manager);
        const entity = repo.create(data);
        const saved = await repo.save(entity);

        this.logger.log(`Post created: ${saved.id}`);

        return await this.findById(saved.id, manager);
    }


    async findByIdWithRelations(id: string, manager?: EntityManager): Promise<PostCustomer | null> {
        return this.getRepository(manager).findOne({
            where: { id },
            relations: {
                customer: {
                    profile: true,
                },
            },
        });
    }


    async findPostsForFeed(limit = 20, offset = 0, manager?: EntityManager) {
        return this.getRepository(manager).createQueryBuilder('post')
            .leftJoinAndSelect('post.customer', 'customer')
            .leftJoinAndSelect('customer.profile', 'profile')
            .where('post.deleted_at IS NULL')
            .orderBy('post.created_at', 'DESC')
            .take(limit)
            .skip(offset)
            .getMany();
    }


    async updatePost(
        id: string,
        data: Partial<PostCustomer>,
        manager?: EntityManager,
    ): Promise<PostCustomer> {
        const repo = this.getRepository(manager);
        await repo.update(id, data);

        this.logger.log(`Post updated: ${id}`);

        const updated = await this.findById(id, manager);
        if (!updated) {
            throw new Error(`Post ${id} not found after update`);
        }

        return updated;
    }


    async findById(
        id: string,
        manager?: EntityManager,
    ): Promise<PostCustomer | null> {
        return await this.getRepository(manager).findOne({
            where: { id, deletedAt: IsNull() },
            relations: {
                customer: {
                    profile: true
                }
            },
        });
    }


    async findByIdAndCustomer(
        id: string,
        customerId: string,
        manager?: EntityManager,
    ): Promise<PostCustomer | null> {
        return await this.getRepository(manager).findOne({
            where: {
                id,
                customerId,
                deletedAt: IsNull(),
            },
            relations: {
                customer: {
                    profile: true
                }
            },
        });
    }


    async findPublicPosts(
        limit: number,
        cursor?: Date,
        manager?: EntityManager,
    ): Promise<PostCustomer[]> {
        const qb = this.getRepository(manager)
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.customer', 'customer')
            .leftJoinAndSelect('customer.profile', 'profile')  
            .where('post.status = :status', { status: PostStatus.OPEN })
            .andWhere('post.deletedAt IS NULL')
            .orderBy('post.createdAt', 'DESC')
            .take(limit);

        if (cursor) {
            qb.andWhere('post.createdAt < :cursor', { cursor });
        }

        return await qb.getMany();
    }


    async findCustomerPosts(
        customerId: string,
        limit: number,
        cursor?: Date,
        manager?: EntityManager,
    ): Promise<PostCustomer[]> {
        const qb = this.getRepository(manager)
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.customer', 'customer')
            .leftJoinAndSelect('customer.profile', 'profile')  
            .where('post.customerId = :customerId', { customerId })
            .andWhere('post.deletedAt IS NULL')
            .orderBy('post.createdAt', 'DESC')
            .take(limit);

        if (cursor) {
            qb.andWhere('post.createdAt < :cursor', { cursor });
        }

        return await qb.getMany();
    }


    async softDelete(id: string, manager?: EntityManager): Promise<void> {
        await this.getRepository(manager).softDelete(id);
        this.logger.log(`Post soft deleted: ${id}`);
    }


    async closePost(
        post: PostCustomer,
        manager?: EntityManager,
    ): Promise<PostCustomer> {
        const repo = this.getRepository(manager);
        post.status = PostStatus.CLOSED;
        const closed = await repo.save(post);

        this.logger.log(`Post closed: ${closed.id}`);
        return closed;
    }


    async countOpenPostsByCustomer(
        customerId: string,
        manager?: EntityManager,
    ): Promise<number> {
        return await this.getRepository(manager).count({
            where: {
                customerId,
                status: PostStatus.OPEN,
                deletedAt: IsNull(),
            },
        });
    }
}