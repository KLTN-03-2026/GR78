import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Certification } from '../entities/certification.entity';
import { CertificationStatus } from '../enums/certification-status.enum';

@Injectable()
export class CertificationRepository {
    private readonly logger = new Logger(CertificationRepository.name);

    constructor(
        @InjectRepository(Certification)
        private readonly repo: Repository<Certification>,
    ) {}

    private getRepo(manager?: EntityManager): Repository<Certification> {
        return manager ? manager.getRepository(Certification) : this.repo;
    }

    async findByUserId(
        userId: string,
        manager?: EntityManager,
    ): Promise<Certification[]> {
        try {
            return await this.getRepo(manager).find({
                where: { userId },
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            this.logger.error(`Error finding certifications for user: ${userId}`, error);
            throw error;
        }
    }

    async findVerifiedByUserId(
        userId: string,
        manager?: EntityManager,
    ): Promise<Certification[]> {
        try {
            return await this.getRepo(manager).find({
                where: { userId, verificationStatus: CertificationStatus.VERIFIED },
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            this.logger.error(`Error finding verified certifications for user: ${userId}`, error);
            throw error;
        }
    }

    async findById(
        id: string,
        manager?: EntityManager,
    ): Promise<Certification | null> {
        try {
            return await this.getRepo(manager).findOne({ where: { id } });
        } catch (error) {
            this.logger.error(`Error finding certification: ${id}`, error);
            throw error;
        }
    }

    async findByIdAndUserId(
        id: string,
        userId: string,
        manager?: EntityManager,
    ): Promise<Certification | null> {
        try {
            return await this.getRepo(manager).findOne({ where: { id, userId } });
        } catch (error) {
            this.logger.error(`Error finding certification ${id} for user: ${userId}`, error);
            throw error;
        }
    }

    async create(
        data: Partial<Certification>,
        manager?: EntityManager,
    ): Promise<Certification> {
        try {
            const cert = this.getRepo(manager).create(data);
            return await this.getRepo(manager).save(cert);
        } catch (error) {
            this.logger.error(`Error creating certification for user: ${data.userId}`, error);
            throw error;
        }
    }

    async delete(id: string, manager?: EntityManager): Promise<void> {
        try {
            await this.getRepo(manager).delete(id);
        } catch (error) {
            this.logger.error(`Error deleting certification: ${id}`, error);
            throw error;
        }
    }

    async countByUserId(
        userId: string,
        manager?: EntityManager,
    ): Promise<number> {
        try {
            return await this.getRepo(manager).count({ where: { userId } });
        } catch (error) {
            this.logger.error(`Error counting certifications for user: ${userId}`, error);
            throw error;
        }
    }
}
