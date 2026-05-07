import { UserRole } from '@/common/enums/user-role.enum';

export interface UserMapper {
    id: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    isVerified?: boolean;
    isActive?: boolean;
    createdAt?: Date;
}
