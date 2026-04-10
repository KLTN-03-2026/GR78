import { UploadService } from '@/common/upload/upload.service';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { toProfile } from '@/modules/profile/mapper/profile-mapper';
import { toUser } from '@/modules/users/mapper/user.mapper';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    ChangeDisplayNameDto,
    DisplayNameChangeResponseDto,
    ProfileResponseDto,
    PublicProfileResponseDto,
    UpdateContactDto,
    UpdateProfileDto,
} from '../dtos/profile.dto';
import { ProfileRepository } from '../repositorys/profile-repository';
import { ProfileDomainService } from './profile-domain.service';
import { ProfileResponseBuilder } from './profile-response-builder.service';


@Injectable()
export class ProfileService {
    private readonly logger = new Logger(ProfileService.name);

    constructor(
        private readonly profileRepo: ProfileRepository,
        private readonly profileBuilder: ProfileResponseBuilder,
        private readonly profileDomainService: ProfileDomainService,
        private readonly dataSource: DataSource,
        private readonly uploadService: UploadService

    ) { }


    async updateAvatarFile(
        jwtUser: JwtPayload,
        file: Express.Multer.File,
    ): Promise<ProfileResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (!file) {
                throw new BadRequestException('Avatar file is required');
            }
            // 1. upload ảnh
            const { publicUrl: avatarUrl } = await this.uploadService.uploadSingle(file, 'avatars');
            // 2. update DB
            const updatedProfile = await this.profileRepo.updateAvatar(
                jwtUser.id,
                avatarUrl,
                queryRunner.manager,
            );

            const user = await this.profileRepo.findUserWithProfile(
                jwtUser.id,
                queryRunner.manager
            );

            await queryRunner.commitTransaction();

            const userMapper = toUser(user!);
            const profileMapper = toProfile(updatedProfile);

            return this.profileBuilder.buildProfileResponse(userMapper, profileMapper);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getMyProfile(jwtUser: JwtPayload): Promise<ProfileResponseDto> {
        try {
            const user = await this.profileRepo.findUserWithProfile(jwtUser.id);

            if (!user) {
                throw new NotFoundException({
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                });
            }

            if (!user.profile) {
                this.logger.warn(`Profile not found for user ${user.id}, creating...`);
                user.profile = await this.profileRepo.createProfile(user.id);
            }

            const userMapper = toUser(user);
            const profileMapper = toProfile(user.profile);

            return this.profileBuilder.buildProfileResponse(userMapper, profileMapper);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.error(`Failed to fetch profile for user: ${jwtUser.id}`, error);
            throw new InternalServerErrorException({
                code: 'PROFILE_FETCH_FAILED',
                message: 'Failed to fetch profile',
            });
        }
    }


    async getPublicProfile(userId: string): Promise<PublicProfileResponseDto> {
        try {
            const user = await this.profileRepo.findUserWithProfile(userId);

            if (!user) {
                throw new NotFoundException({
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                });
            }

            if (!user.isActive) {
                throw new NotFoundException({
                    code: 'USER_NOT_ACTIVE',
                    message: 'User account is not active',
                });
            }

            if (!user.profile) {
                throw new NotFoundException({
                    code: 'PROFILE_NOT_FOUND',
                    message: 'Profile not found',
                });
            }

            const userMapper = toUser(user);
            const profileMapper = toProfile(user.profile);

            return this.profileBuilder.buildPublicProfileResponse(
                userMapper,
                profileMapper
            );
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.error(`Failed to fetch public profile: ${userId}`, error);
            throw new InternalServerErrorException({
                code: 'PUBLIC_PROFILE_FETCH_FAILED',
                message: 'Failed to fetch public profile',
            });
        }
    }


    async updateProfile(
        jwtUser: JwtPayload,
        dto: UpdateProfileDto,
    ): Promise<ProfileResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await this.profileRepo.findUserWithProfile(
                jwtUser.id,
                queryRunner.manager
            );

            if (!user) {
                throw new NotFoundException({
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                });
            }

            if (!user.profile) {
                user.profile = await this.profileRepo.createProfile(
                    user.id,
                    dto,
                    queryRunner.manager
                );
            } else {
                user.profile = await this.profileRepo.updateProfile(
                    user.profile,
                    dto,
                    queryRunner.manager
                );
            }

            await queryRunner.commitTransaction();

            this.logger.log(`Profile updated for user: ${user.id}`);

            const userMapper = toUser(user);
            const profileMapper = toProfile(user.profile);

            return this.profileBuilder.buildProfileResponse(userMapper, profileMapper);

        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            this.logger.error(`Failed to update profile for user: ${jwtUser.id}`, error);
            throw new InternalServerErrorException({
                code: 'PROFILE_UPDATE_FAILED',
                message: 'Failed to update profile',
            });
        } finally {
            await queryRunner.release();
        }
    }


    async updateContact(
        jwtUser: JwtPayload,
        dto: UpdateContactDto,
    ): Promise<ProfileResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await this.profileRepo.findUserWithProfile(
                jwtUser.id,
                queryRunner.manager
            );

            if (!user) {
                throw new NotFoundException({
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                });
            }

            if (dto.email) {
                const emailTaken = await this.profileRepo.isEmailTaken(
                    dto.email,
                    user.id,
                    queryRunner.manager,
                );

                if (emailTaken) {
                    throw new ConflictException({
                        code: 'EMAIL_ALREADY_EXISTS',
                        message: 'Email is already in use',
                    });
                }
            }

            if (dto.phone) {
                const phoneTaken = await this.profileRepo.isPhoneTaken(
                    dto.phone,
                    user.id,
                    queryRunner.manager,
                );

                if (phoneTaken) {
                    throw new ConflictException({
                        code: 'PHONE_ALREADY_EXISTS',
                        message: 'Phone number is already in use',
                    });
                }
            }

            const updatedUser = await this.profileRepo.updateContact(
                user,
                dto,
                queryRunner.manager
            );

            await queryRunner.commitTransaction();

            this.logger.log(`Contact info updated for user: ${updatedUser.id}`);

            const userMapper = toUser(updatedUser);
            const profileMapper = toProfile(user.profile!);

            return this.profileBuilder.buildProfileResponse(userMapper, profileMapper);

        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }

            this.logger.error(`Failed to update contact for user: ${jwtUser.id}`, error);
            throw new InternalServerErrorException({
                code: 'CONTACT_UPDATE_FAILED',
                message: 'Failed to update contact information',
            });
        } finally {
            await queryRunner.release();
        }
    }


    async changeDisplayName(
        jwtUser: JwtPayload,
        dto: ChangeDisplayNameDto,
    ): Promise<DisplayNameChangeResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await this.profileRepo.findUserWithProfile(
                jwtUser.id,
                queryRunner.manager
            );

            if (!user || !user.profile) {
                throw new NotFoundException({
                    code: 'USER_NOT_FOUND',
                    message: 'User or profile not found',
                });
            }

            const profileMapper = toProfile(user.profile);

            if (!this.profileDomainService.canChangeDisplayName(profileMapper)) {
                const daysUntilCanChange =
                    this.profileDomainService.getDaysUntilCanChangeDisplayName(profileMapper);

                throw new ForbiddenException({
                    code: 'DISPLAY_NAME_CHANGE_RESTRICTED',
                    message: `You can only change your display name once every 30 days. Please wait ${daysUntilCanChange} more day(s).`,
                    daysUntilCanChange,
                });
            }

            const validation = this.profileDomainService.validateDisplayNameChange(
                profileMapper.displayName,
                dto.displayName
            );

            if (!validation.valid) {
                throw new BadRequestException({
                    code: 'INVALID_DISPLAY_NAME',
                    message: validation.error,
                });
            }

            const updatedProfile = await this.profileRepo.changeDisplayName(
                user.profile,
                dto.displayName,
                queryRunner.manager,
            );

            await queryRunner.commitTransaction();

            this.logger.log(
                `Display name changed for user: ${user.id} ` +
                `(Count: ${updatedProfile.displayNameChangeCount})`,
            );

            return {
                success: true,
                message: 'Display name changed successfully',
                newDisplayName: updatedProfile.displayName!,
                changedAt: updatedProfile.lastDisplayNameChange!,
                daysUntilNextChange: 30,
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (
                error instanceof NotFoundException ||
                error instanceof ForbiddenException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            this.logger.error(`Failed to change display name for user: ${jwtUser.id}`, error);
            throw new InternalServerErrorException({
                code: 'DISPLAY_NAME_CHANGE_FAILED',
                message: 'Failed to change display name',
            });
        } finally {
            await queryRunner.release();
        }
    }


    async updateAvatar(
        jwtUser: JwtPayload,
        avatarUrl: string,
    ): Promise<ProfileResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const updatedProfile = await this.profileRepo.updateAvatar(
                jwtUser.id,
                avatarUrl,
                queryRunner.manager,
            );

            const user = await this.profileRepo.findUserWithProfile(
                jwtUser.id,
                queryRunner.manager
            );

            await queryRunner.commitTransaction();

            this.logger.log(`Avatar updated for user: ${jwtUser.id}`);

            const userMapper = toUser(user!);
            const profileMapper = toProfile(updatedProfile);

            return this.profileBuilder.buildProfileResponse(userMapper, profileMapper);

        } catch (error) {
            await queryRunner.rollbackTransaction();

            this.logger.error(`Failed to update avatar for user: ${jwtUser.id}`, error);
            throw new InternalServerErrorException({
                code: 'AVATAR_UPDATE_FAILED',
                message: 'Failed to update avatar',
            });
        } finally {
            await queryRunner.release();
        }
    }


    async deleteAccount(
        jwtUser: JwtPayload
    ): Promise<{ success: boolean; message: string }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await this.profileRepo.softDeleteUser(jwtUser.id, queryRunner.manager);
            await queryRunner.commitTransaction();

            this.logger.log(`Account deleted for user: ${jwtUser.id}`);
            return {
                success: true,
                message: 'Account deleted successfully',
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();

            this.logger.error(`Failed to delete account for user: ${jwtUser.id}`, error);
            throw new InternalServerErrorException({
                code: 'ACCOUNT_DELETE_FAILED',
                message: 'Failed to delete account',
            });
        } finally {
            await queryRunner.release();
        }
    }


    async searchProfiles(
        searchTerm: string,
        limit: number = 20,
        offset: number = 0,
    ): Promise<{ profiles: PublicProfileResponseDto[]; total: number }> {
        try {
            const [profiles, total] = await this.profileRepo.searchProfilesByDisplayName(
                searchTerm,
                limit,
                offset,
            );

            const mappedProfiles = profiles.map(profile => {
                const userMapper = toUser(profile.user);
                const profileMapper = toProfile(profile);

                return this.profileBuilder.buildPublicProfileResponse(
                    userMapper,
                    profileMapper
                );
            });

            return { profiles: mappedProfiles, total };

        } catch (error) {
            this.logger.error(`Failed to search profiles: ${searchTerm}`, error);
            throw new InternalServerErrorException({
                code: 'PROFILE_SEARCH_FAILED',
                message: 'Failed to search profiles',
            });
        }
    }
}