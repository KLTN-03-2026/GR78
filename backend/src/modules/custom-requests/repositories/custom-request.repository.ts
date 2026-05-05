import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindManyOptions, Repository } from 'typeorm';
import { CustomRequest } from '../entities/custom-request.entity';
import { CustomRequestStatus } from '../enums/custom-request-status.enum';

@Injectable()
export class CustomRequestRepository {
    constructor(
        @InjectRepository(CustomRequest)
        private readonly repository: Repository<CustomRequest>,
    ) {}

    private getRepo(manager?: EntityManager): Repository<CustomRequest> {
        return manager ? manager.getRepository(CustomRequest) : this.repository;
    }

    create(data: Partial<CustomRequest>, manager?: EntityManager): CustomRequest {
        return this.getRepo(manager).create(data);
    }

    async save(entity: CustomRequest, manager?: EntityManager): Promise<CustomRequest> {
        return await this.getRepo(manager).save(entity);
    }

    async findById(id: string, manager?: EntityManager): Promise<CustomRequest | null> {
        return await this.getRepo(manager).findOne({ where: { id } });
    }

    async findOne(options: FindManyOptions<CustomRequest>, manager?: EntityManager): Promise<CustomRequest | null> {
        return await this.getRepo(manager).findOne(options as any);
    }

    async findByIdWithRelations(
        id: string,
        relations: string[],
        manager?: EntityManager,
    ): Promise<CustomRequest | null> {
        return await this.getRepo(manager).findOne({ where: { id }, relations });
    }

    async findByCustomer(
        customerId: string,
        status?: CustomRequestStatus,
        page: number = 1,
        limit: number = 10,
        manager?: EntityManager,
    ): Promise<{ data: CustomRequest[]; total: number }> {
        const where: any = { customerId };
        if (status) where.status = status;

        const [data, total] = await this.getRepo(manager).findAndCount({
            where,
            relations: ['provider', 'provider.profile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { data, total };
    }

    async findByProvider(
        providerId: string,
        status?: CustomRequestStatus,
        page: number = 1,
        limit: number = 10,
        manager?: EntityManager,
    ): Promise<{ data: CustomRequest[]; total: number }> {
        const where: any = { providerId };
        if (status) where.status = status;

        const [data, total] = await this.getRepo(manager).findAndCount({
            where,
            relations: ['customer', 'customer.profile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { data, total };
    }

    async softDelete(id: string, manager?: EntityManager): Promise<void> {
        await this.getRepo(manager).softDelete(id);
    }
}
