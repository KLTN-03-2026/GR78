export interface DisplayNameChangeInfo {
    canChange: boolean;
    lastChanged?: Date;
    changeCount: number;
    daysUntilNextChange: number;
}


export interface ProfileMapper {
    id: string;
    userId: string;
    fullName?: string;
    displayName?: string;
    avatarUrl?: string;
    bio?: string;
    address?: string;
    birthday?: Date;
    gender?: string;
    lastDisplayNameChange?: Date;
    displayNameChangeCount: number;
    displayNameHistory?: Record<string, any>; 
    updatedAt: Date;
    createdAt: Date;
}