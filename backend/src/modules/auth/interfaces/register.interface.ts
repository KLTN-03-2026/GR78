import { UserRole } from '@/common/enums/user-role.enum';


export interface RegisterResult {
    id: string;
    email?: string;
    phone?: string;
    fullName?: string;
    role?: UserRole
}