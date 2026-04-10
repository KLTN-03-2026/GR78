import { BadRequestException } from '@nestjs/common';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { User } from '@/modules/users/entities/user.entity';


export function toJwtPayload(user: User): JwtPayload {
    if (!user?.id || !user?.email || !user?.role) {
        throw new BadRequestException({
            code: 'INVALID_USER_DATA',
            message: 'User data is incomplete',
        });
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,
    };
}