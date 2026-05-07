import { Injectable } from '@nestjs/common';
import { ProfileMapper } from '../interfaces/profile.interface';


@Injectable()
export class ProfileDomainService {
    private readonly DISPLAY_NAME_CHANGE_COOLDOWN_DAYS = 30;

    
    canChangeDisplayName(profile: ProfileMapper): boolean {
        if (!profile.lastDisplayNameChange) {
            return true; 
        }

        const daysSinceLastChange = this.getDaysSinceLastChange(
            profile.lastDisplayNameChange
        );

        return daysSinceLastChange >= this.DISPLAY_NAME_CHANGE_COOLDOWN_DAYS;
    }

    
    getDaysUntilCanChangeDisplayName(profile: ProfileMapper): number {
        if (!profile.lastDisplayNameChange) {
            return 0; 
        }

        const daysSinceLastChange = this.getDaysSinceLastChange(
            profile.lastDisplayNameChange
        );

        const daysRemaining =
            this.DISPLAY_NAME_CHANGE_COOLDOWN_DAYS - daysSinceLastChange;

        return Math.max(0, Math.ceil(daysRemaining));
    }

   
    calculateCompletionPercentage(profile: ProfileMapper): {
        isComplete: boolean;
        percentage: number;
        completedFields: number;
        totalFields: number;
        missingFields: string[];
    } {
        const requiredFields = {
            fullName: !!profile.fullName,
            displayName: !!profile.displayName,
            birthday: !!profile.birthday,
            gender: !!profile.gender,
            bio: !!profile.bio && profile.bio.length >= 10,
            avatarUrl: !!profile.avatarUrl,
        };

        const totalFields = Object.keys(requiredFields).length;
        const completedFields = Object.values(requiredFields).filter(Boolean).length;
        const percentage = Math.round((completedFields / totalFields) * 100);

        const missingFields = Object.entries(requiredFields)
            .filter(([, value]) => !value)
            .map(([key]) => key);

        return {
            isComplete: percentage === 100,
            percentage,
            completedFields,
            totalFields,
            missingFields,
        };
    }

    
    validateDisplayNameChange(
        currentDisplayName: string | undefined,
        newDisplayName: string
    ): { valid: boolean; error?: string } {
        if (!newDisplayName || newDisplayName.trim().length === 0) {
            return { valid: false, error: 'Display name cannot be empty' };
        }

        if (currentDisplayName === newDisplayName) {
            return {
                valid: false,
                error: 'New display name must be different from current one',
            };
        }

        return { valid: true };
    }


    private getDaysSinceLastChange(lastChangeDate: Date): number {
        const now = new Date();
        const lastChange = new Date(lastChangeDate);
        const diffInMs = now.getTime() - lastChange.getTime();
        return diffInMs / (1000 * 60 * 60 * 24);
    }
}