import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../enums/notification.enum';

@Injectable()
export class NotificationRepository {
    constructor(
        @InjectRepository(Notification)
        private readonly repository: Repository<Notification>,
    ) { }

    private getRepository(manager?: EntityManager): Repository<Notification> {
        return manager ? manager.getRepository(Notification) : this.repository;
    }

    create(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        metadata?: Record<string, any>;
        actionUrl?: string;
        isRead: boolean;
    },
        manager?: EntityManager): Notification {
        return this.getRepository(manager).create(data);
    }


    async insert(entities: Partial<Notification>[]): Promise<void> {
        await this.createQueryBuilder()
            .insert()
            .into(Notification)
            .values(entities)
            .execute();
    }

    async save(notification: Notification, manager?: EntityManager): Promise<Notification> {
        return await this.getRepository(manager).save(notification);
    }


    async findAndCount(options: {
        where: any;
        order: any;
        skip: number;
        take: number;
    }, manager?: EntityManager
    ): Promise<[Notification[], number]> {
        return await this.getRepository(manager).findAndCount(options);
    }


    async count(options: { where: any }, manager?: EntityManager): Promise<number> {
        return await this.getRepository(manager).count(options);
    }


    async findOne(options: { where: any }, manager?: EntityManager): Promise<Notification | null> {
        return await this.getRepository(manager).findOne(options);
    }


    createQueryBuilder(manager?: EntityManager) {
        return this.getRepository(manager).createQueryBuilder();
    }


    async delete(criteria: any, manager?: EntityManager): Promise<void> {
        await this.getRepository(manager).delete(criteria);
    }
}