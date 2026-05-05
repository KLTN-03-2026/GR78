import { UserRole } from '@/common/enums/user-role.enum';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
    private readonly logger = new Logger(UserRepository.name);

    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) { }

    private getRepository(manager?: EntityManager): Repository<User> {
        return manager ? manager.getRepository(User) : this.repo;
    }

    async findByEmail(email: string, manager?: EntityManager): Promise<User | null> {
        return await this.getRepository(manager).findOne({ where: { email } });
    }

    async findByPhone(phone: string, manager?: EntityManager): Promise<User | null> {
        return await this.getRepository(manager).findOne({ where: { phone } });
    }

    async findByIdentifier(identifier: string, manager?: EntityManager): Promise<User | null> {
        return await this.getRepository(manager).findOne({
            where: [
                { email: identifier.toLowerCase() },
                { phone: identifier },
            ],
            select: ['id', 'email', 'phone', 'role', 'passwordHash'],
        });
    }

    async findById(id: string, manager?: EntityManager): Promise<User | null> {
        return await this.getRepository(manager).findOne({ where: { id } });
    }



    async findByIdProvider(id: string, manager?: EntityManager): Promise<User | null> {
        return await this.getRepository(manager).findOne({ where: { id, role: UserRole.PROVIDER, isActive: true } });
    }

    async createUser(data: Partial<User>, manager?: EntityManager): Promise<User> {
        const repository = this.getRepository(manager);
        const entity = repository.create(data);
        const saved = await repository.save(entity);

        this.logger.log(`User created: ${saved.id}`);
        return saved;
    }

    async updateUser(
        id: string,
        data: Partial<User>,
        manager?: EntityManager,
    ): Promise<User> {
        const repository = this.getRepository(manager);
        await repository.update(id, data);

        const updated = await this.findById(id, manager);
        if (!updated) {
            throw new Error(`User ${id} not found after update`);
        }

        this.logger.log(`User updated: ${id}`);
        return updated;
    }


}