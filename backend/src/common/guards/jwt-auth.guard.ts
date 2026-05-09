import { JwtService } from '@/common/services/jwt.service';
import { ErrorUtil } from '@/common/utils/error.util';
import {
    InvalidTokenException,
} from '@/modules/auth/exceptions/auth.exception';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        const token = this.jwtService.extractTokenFromHeader(authHeader);
        if (!token) {
            throw new UnauthorizedException({
                code: 'TOKEN_MISSING',
                message: 'Authorization token missing',
            });
        }

        try {
            const payload: JwtPayload = this.jwtService.verifyAccessToken(token);
            request.user = payload;


            return true;
        } catch (error: unknown) {
            if (
                ErrorUtil.isKnownException(
                    error,
                    InvalidTokenException,
                )
            ) {
                throw error;
            }

            throw new UnauthorizedException({
                code: 'TOKEN_INVALID',
                message: 'Access token is invalid',
            });
        }
    }
}
