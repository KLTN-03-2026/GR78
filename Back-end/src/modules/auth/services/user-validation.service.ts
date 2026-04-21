import { UserRole } from '@/common/enums/user-role.enum';
import {
    EmailAlreadyExistsException,
    InvalidCredentialsException,
    PhoneAlreadyExistsException,
} from '@/modules/auth/exceptions/auth.exception';
import { User } from '@/modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UserRepository } from '../../users/repositorys/user.repository';
import { PasswordUtil } from '../utils/password.util';


@Injectable()
export class UserValidationService {
    constructor(
        private readonly userRepo: UserRepository,
    ) { }

    async checkEmailExists(email: string, manager?: EntityManager): Promise<void> {
        const existingEmail = await this.userRepo.findByEmail(email, manager);
        if (existingEmail) {
            throw new EmailAlreadyExistsException(email);
        }
    }

    async checkPhoneExists(phone: string, manager?: EntityManager): Promise<void> {
        const existingPhone = await this.userRepo.findByPhone(phone, manager);
        if (existingPhone) {
            throw new PhoneAlreadyExistsException(phone);
        }
    }

    async validateCredentials(
        identifier: string,
        password: string,
        manager?: EntityManager,
    ): Promise<User> {
        const user = await this.userRepo.findByIdentifier(
            identifier.toLowerCase().trim(),
            manager,
        );

        const isMatch = await PasswordUtil.compareConstantTime(
            password,
            user?.passwordHash || null,
        );

        if (!user || !isMatch) {
            throw new InvalidCredentialsException();
        }

        return user;
    }

    async findById(userId: string, manager?: EntityManager): Promise<User | null> {
        return await this.userRepo.findById(userId, manager);
    }

    async createUser(
        data: {
            email?: string;
            phone?: string;
            passwordHash: string;
            role?: UserRole
            isVerified:boolean,
            isActive: boolean,
        },
        manager?: EntityManager,
    ): Promise<User> {
        return await this.userRepo.createUser(data, manager);
    }


}