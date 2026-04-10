import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Quote } from '../entities/quote.entity';

@Injectable()
export class QuoteRepository {
    constructor(
        @InjectRepository(Quote)
        private readonly repository: Repository<Quote>,
    ) { }
    private getRepository(manager?: EntityManager): Repository<Quote> {
        return manager ? manager.getRepository(Quote) : this.repository;
    }

    create(data: Partial<Quote>, manager? : EntityManager): Quote {
        return this.getRepository(manager).create(data);
    }

    async save(quote: Quote, manager?: EntityManager): Promise<Quote> {
        return await this.getRepository(manager).save(quote);
    }


    async findOne(options: any, manager?: EntityManager): Promise<Quote | null> {
        return await this.getRepository(manager).findOne(options);
    }


    async find(options: any, manager?: EntityManager): Promise<Quote[]> {
        return await this.getRepository(manager).find(options);
    }


    async count(options: any, manager?: EntityManager): Promise<number> {
        return await this.getRepository(manager).count(options);
    }


    createQueryBuilder(alias?: string, manager?: EntityManager) {
        return this.getRepository(manager).createQueryBuilder(alias);
    }


    async softDelete(id: string, manager?: EntityManager): Promise<void> {
        await this.getRepository(manager).softDelete(id);
    }
}