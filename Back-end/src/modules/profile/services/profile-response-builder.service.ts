import { ProfileMapper } from '@/modules/profile/interfaces/profile.interface';
import { UserMapper } from '@/modules/users/interface/user.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    MinimalProfileDto,
    ProfileCompletionDto,
    ProfileResponseDto,
    PublicProfileResponseDto,
} from '../dtos/profile.dto';
import { ProfileDomainService } from './profile-domain.service';


@Injectable()
export class ProfileResponseBuilder {
    private readonly logger = new Logger(ProfileResponseBuilder.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly profileDomainService: ProfileDomainService,
    ) { }

    
    buildProfileResponse(
        user: UserMapper,
        profile: ProfileMapper
    ): ProfileResponseDto {
        this.validateInputs(user, profile, 'buildProfileResponse');

        try {
            return {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                fullName: profile.fullName,
                displayName: profile.displayName,
                avatarUrl: this.buildAvatarUrl(profile.avatarUrl),
                bio: profile.bio,
                address: profile.address,
                birthday: profile.birthday,
                gender: profile.gender,
                isVerified: user.isVerified,
                isActive: user.isActive,
                displayNameChangeInfo: this.buildDisplayNameChangeInfo(profile),
                createdAt: user.createdAt,
                updatedAt: profile.updatedAt,
            };
        } catch (error) {
            this.logger.error(
                `Failed to build profile response for user ${user.id}`,
                error
            );
            throw new Error('Failed to build profile response');
        }
    }

    
    buildPublicProfileResponse(
        user: UserMapper,
        profile: ProfileMapper,
    ): PublicProfileResponseDto {
        this.validateInputs(user, profile, 'buildPublicProfileResponse');

        try {
            return {
                id: user.id,
                role: user.role,
                displayName: profile.displayName || 'Anonymous User',
                avatarUrl: this.buildAvatarUrl(profile.avatarUrl),
                bio: profile.bio,
                isVerified: user.isVerified,
                memberSince: user.createdAt,
            };
        } catch (error) {
            this.logger.error(
                `Failed to build public profile for user ${user.id}`,
                error
            );
            throw new Error('Failed to build public profile');
        }
    }

    
    buildMinimalProfile(
        user: UserMapper,
        profile: ProfileMapper
    ): MinimalProfileDto {
        this.validateInputs(user, profile, 'buildMinimalProfile');

        try {
            return {
                id: user.id,
                displayName: profile.displayName || 'Anonymous',
                avatarUrl: this.buildAvatarUrl(profile.avatarUrl),
                isVerified: user.isVerified,
            };
        } catch (error) {
            this.logger.error(
                `Failed to build minimal profile for user ${user.id}`,
                error
            );
            return {
                id: user.id,
                displayName: 'User',
                avatarUrl: this.getDefaultAvatarUrl(),
                isVerified: false,
            };
        }
    }

    
    buildProfileCompletionStatus(profile: ProfileMapper): ProfileCompletionDto {
        if (!profile) {
            this.logger.warn('Profile is null in buildProfileCompletionStatus');
            return this.getEmptyCompletionStatus();
        }

        try {
            const completion = this.profileDomainService.calculateCompletionPercentage(
                profile
            );

            return {
                isComplete: completion.isComplete,
                completionPercentage: completion.percentage,
                completedFields: completion.completedFields,
                totalFields: completion.totalFields,
                missingFields: completion.missingFields,
            };
        } catch (error) {
            this.logger.error(
                'Failed to build profile completion status',
                error
            );
            return this.getEmptyCompletionStatus();
        }
    }

    
    buildMinimalProfiles(
        usersWithProfiles: Array<{ user: UserMapper; profile: ProfileMapper }>,
    ): MinimalProfileDto[] {
        if (!Array.isArray(usersWithProfiles)) {
            this.logger.warn('Invalid input for buildMinimalProfiles');
            return [];
        }

        return usersWithProfiles
            .map(({ user, profile }) => {
                try {
                    return this.buildMinimalProfile(user, profile);
                } catch (error) {
                    this.logger.warn(
                        `Skipped building minimal profile for user ${user?.id}`,
                        error
                    );
                    return null;
                }
            })
            .filter((profile): profile is MinimalProfileDto => profile !== null);
    }


    
    private validateInputs(
        user: UserMapper,
        profile: ProfileMapper,
        method: string,
    ): void {
        if (!user || !profile) {
            this.logger.error(
                `Invalid input in ${method}: user=${!!user}, profile=${!!profile}`,
            );
            throw new Error('User and Profile are required');
        }

        if (!user.id) {
            this.logger.error(`User missing ID in ${method}`);
            throw new Error('User ID is required');
        }
    }

    
    private buildDisplayNameChangeInfo(profile: ProfileMapper) {
        try {
            return {
                canChange: this.profileDomainService.canChangeDisplayName(profile),
                lastChanged: profile.lastDisplayNameChange,
                changeCount: profile.displayNameChangeCount,
                daysUntilNextChange: this.profileDomainService.getDaysUntilCanChangeDisplayName(profile),
            };
        } catch (error) {
            this.logger.warn(
                'Failed to build display name change info',
                error
            );
            return {
                canChange: false,
                lastChanged: undefined,
                changeCount: 0,
                daysUntilNextChange: 0,
            };
        }
    }

    
    private buildAvatarUrl(avatarUrl?: string): string {
        if (!avatarUrl) {
            return this.getDefaultAvatarUrl();
        }

        if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
            return avatarUrl;
        }

        const cdnUrl = this.configService.get<string>('CDN_URL');
        if (!cdnUrl) {
            this.logger.warn('CDN_URL not configured, returning relative path');
            return avatarUrl;
        }

        return `${cdnUrl}/${avatarUrl}`;
    }

    
    private getDefaultAvatarUrl(): string {
        return (
            this.configService.get<string>('DEFAULT_AVATAR_URL') ||
            '/assets/default-avatar.png'
        );
    }

    
    private getEmptyCompletionStatus(): ProfileCompletionDto {
        return {
            isComplete: false,
            completionPercentage: 0,
            completedFields: 0,
            totalFields: 6,
            missingFields: [
                'fullName',
                'displayName',
                'birthday',
                'gender',
                'bio',
                'avatarUrl',
            ],
        };
    }
}