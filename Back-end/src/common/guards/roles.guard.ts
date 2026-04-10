import { ROLES_KEY } from '@/common/decorators/@Roles';
import { UserRole } from '@/common/enums/user-role.enum';

import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable, UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user as JwtPayload;

        if (!user) {
            throw new UnauthorizedException({
                code: 'USER_NOT_AUTHENTICATED',
                message: 'User is not authenticated',
            });
        }

        if (!user.role) {
            throw new ForbiddenException({
                code: 'ROLE_MISSING',
                message: 'User role not found in token',
            });
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException({
                code: 'ACCESS_DENIED',
                message: `Access denied. Requires role: ${requiredRoles.join(', ')}`,
            });
        }

        return true;
    }
}
