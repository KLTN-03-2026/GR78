import { User } from '@/modules/users/entities/user.entity';
import { UserMapper } from '@/modules/users/interface/user.interface';
import { BadRequestException } from '@nestjs/common';

export function toUser(user: User): UserMapper {
    if (!user?.id || !user?.email || !user?.role) {
        throw new BadRequestException({
            code: 'INVALID_USER_DATA',
            message: 'User data is incomplete',
        });
    }
    return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
    };
}