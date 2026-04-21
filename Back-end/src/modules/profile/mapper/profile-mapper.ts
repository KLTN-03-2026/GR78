import { BadRequestException } from '@nestjs/common';
import { Profile } from '../entities/profile.entity';
import { ProfileMapper } from '../interfaces/profile.interface';


export function toProfile(profile: Profile): ProfileMapper {
    if (!profile?.id || !profile?.userId) {
        throw new BadRequestException({
            code: 'INVALID_PROFILE_DATA',
            message: 'Profile data is incomplete - missing id or userId',
        });
    }

    return {
        id: profile.id,
        userId: profile.userId,
        fullName: profile.fullName,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        address: profile.address,
        birthday: profile.birthday,
        gender: profile.gender,
        lastDisplayNameChange: profile.lastDisplayNameChange,
        displayNameChangeCount: profile.displayNameChangeCount ?? 0,
        displayNameHistory: profile.displayNameHistory,
        updatedAt: profile.updatedAt,
        createdAt: profile.createdAt,
    };
}


export function toProfiles(profiles: Profile[]): ProfileMapper[] {
    return profiles
        .filter(profile => profile?.id && profile?.userId)
        .map(profile => toProfile(profile));
}