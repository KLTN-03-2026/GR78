import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException
} from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        const user: JwtPayload = request.user;

        if (!user?.id) {
            throw new UnauthorizedException({
                code: 'USER_NOT_AUTHENTICATED',
                message: 'User is not authenticated',
            });
        }

        return user.id;
    },
);