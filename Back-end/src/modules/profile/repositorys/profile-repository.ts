import { User } from '@/modules/users/entities/user.entity';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum';
import { UpdateContactDto, UpdateProfileDto } from '../dtos/profile.dto';
import { Profile } from '../entities/profile.entity';
@Injectable()
export class ProfileRepository {
    private readonly logger = new Logger(ProfileRepository.name);

    constructor(
        @InjectRepository(Profile)
        private readonly profileRepo: Repository<Profile>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    
    private getProfileRepository(manager?: EntityManager): Repository<Profile> {
        return manager ? manager.getRepository(Profile) : this.profileRepo;
    }

    private getUserRepository(manager?: EntityManager): Repository<User> {
        return manager ? manager.getRepository(User) : this.userRepo;
    }

    
    async findUserWithProfile(
        userId: string,
        manager?: EntityManager
    ): Promise<User | null> {
        try {
            return await this.getUserRepository(manager).findOne({
                where: { id: userId, deletedAt: IsNull() },
                relations: ['profile'],
            });
        } catch (error) {
            this.logger.error(`Error finding user with profile: ${userId}`, error);
            throw error;
        }
    }

    
    async findProfileByUserId(
        userId: string,
        manager?: EntityManager
    ): Promise<Profile | null> {
        try {
            return await this.getProfileRepository(manager).findOne({
                where: { userId },
                relations: ['user'],
            });
        } catch (error) {
            this.logger.error(`Error finding profile for user: ${userId}`, error);
            throw error;
        }
    }

 
    async createProfile(
        userId: string,
        data?: Partial<Profile>,
        manager?: EntityManager
    ): Promise<Profile> {
        try {
            const profile = this.getProfileRepository(manager).create({
                userId,
                ...data,
            });

            return await this.getProfileRepository(manager).save(profile);
        } catch (error) {
            this.logger.error(`Error creating profile for user: ${userId}`, error);
            throw error;
        }
    }

   
    async updateProfile(
        profile: Profile,
        dto: UpdateProfileDto,
        manager?: EntityManager
    ): Promise<Profile> {
        try {
            Object.keys(dto).forEach((key) => {
                if (dto[key] !== undefined) {
                    profile[key] = dto[key];
                }
            });

            return await this.getProfileRepository(manager).save(profile);
        } catch (error) {
            this.logger.error(`Error updating profile: ${profile.id}`, error);
            throw error;
        }
    }

    
    async updateContact(
        user: User,
        dto: UpdateContactDto,
        manager?: EntityManager
    ): Promise<User> {
        try {
            if (dto.email !== undefined) user.email = dto.email;
            if (dto.phone !== undefined) user.phone = dto.phone;

            return await this.getUserRepository(manager).save(user);
        } catch (error) {
            this.logger.error(`Error updating contact for user: ${user.id}`, error);
            throw error;
        }
    }

    
    async changeDisplayName(
        profile: Profile,
        newDisplayName: string,
        manager?: EntityManager
    ): Promise<Profile> {
        try {
            const oldDisplayName = profile.displayName;

            profile.displayName = newDisplayName;
            profile.lastDisplayNameChange = new Date();
            profile.displayNameChangeCount += 1;

            profile.addDisplayNameToHistory(oldDisplayName, newDisplayName);

            return await this.getProfileRepository(manager).save(profile);
        } catch (error) {
            this.logger.error(`Error changing display name for profile: ${profile.id}`, error);
            throw error;
        }
    }

   
    async updateAvatar(
        userId: string,
        avatarUrl: string,
        manager?: EntityManager
    ): Promise<Profile> {
        try {
            const profile = await this.findProfileByUserId(userId, manager);

            if (!profile) {
                throw new NotFoundException('Profile not found');
            }

            profile.avatarUrl = avatarUrl;
            return await this.getProfileRepository(manager).save(profile);
        } catch (error) {
            this.logger.error(`Error updating avatar for user: ${userId}`, error);
            throw error;
        }
    }

    
    async isEmailTaken(
        email: string,
        excludeUserId?: string,
        manager?: EntityManager
    ): Promise<boolean> {
        try {
            const query = this.getUserRepository(manager)
                .createQueryBuilder('user')
                .where('LOWER(user.email) = LOWER(:email)', { email })
                .andWhere('user.deletedAt IS NULL');

            if (excludeUserId) {
                query.andWhere('user.id != :userId', { userId: excludeUserId });
            }

            const count = await query.getCount();
            return count > 0;
        } catch (error) {
            this.logger.error(`Error checking email availability: ${email}`, error);
            throw error;
        }
    }

    
    async isPhoneTaken(
        phone: string,
        excludeUserId?: string,
        manager?: EntityManager
    ): Promise<boolean> {
        try {
            const query = this.getUserRepository(manager)
                .createQueryBuilder('user')
                .where('user.phone = :phone', { phone })
                .andWhere('user.deletedAt IS NULL');

            if (excludeUserId) {
                query.andWhere('user.id != :userId', { userId: excludeUserId });
            }

            const count = await query.getCount();
            return count > 0;
        } catch (error) {
            this.logger.error(`Error checking phone availability: ${phone}`, error);
            throw error;
        }
    }

    
    async softDeleteUser(
        userId: string,
        manager?: EntityManager
    ): Promise<void> {
        try {
            await this.getUserRepository(manager).softDelete(userId);
            this.logger.log(`User soft deleted: ${userId}`);
        } catch (error) {
            this.logger.error(`Error soft deleting user: ${userId}`, error);
            throw error;
        }
    }

    
    async findUsersByRole(
        role: UserRole,
        limit: number = 100,
        offset: number = 0,
        manager?: EntityManager
    ): Promise<[User[], number]> {
        try {
            return await this.getUserRepository(manager).findAndCount({
                where: { role, deletedAt: IsNull() },
                relations: ['profile'],
                take: limit,
                skip: offset,
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            this.logger.error(`Error finding users by role: ${role}`, error);
            throw error;
        }
    }

    
    async searchProfilesByDisplayName(
        searchTerm: string,
        limit: number = 20,
        offset: number = 0,
        manager?: EntityManager
    ): Promise<[Profile[], number]> {
        try {
            const query = this.getProfileRepository(manager)
                .createQueryBuilder('profile')
                .leftJoinAndSelect('profile.user', 'user')
                .where('profile.displayName ILIKE :searchTerm', {
                    searchTerm: `%${searchTerm}%`
                })
                .andWhere('user.deletedAt IS NULL')
                .andWhere('user.isActive = :isActive', { isActive: true })
                .take(limit)
                .skip(offset)
                .orderBy('profile.displayName', 'ASC');

            return await query.getManyAndCount();
        } catch (error) {
            this.logger.error(`Error searching profiles: ${searchTerm}`, error);
            throw error;
        }
    }

    
    async getProfileStats(manager?: EntityManager): Promise<{
        totalProfiles: number;
        completeProfiles: number;
        incompleteProfiles: number;
        profilesWithAvatar: number;
    }> {
        try {
            const repo = this.getProfileRepository(manager);

            const [
                totalProfiles,
                profilesWithAvatar,
            ] = await Promise.all([
                repo.count(),
                repo.count({ where: { avatarUrl: IsNull() } }),
            ]);

            return {
                totalProfiles,
                completeProfiles: 0, 
                incompleteProfiles: 0,
                profilesWithAvatar,
            };
        } catch (error) {
            this.logger.error('Error getting profile stats', error);
            throw error;
        }
    }
}