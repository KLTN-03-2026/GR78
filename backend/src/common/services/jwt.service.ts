import { JWT_AUDIENCE, JWT_ISSUER } from '@/common/constants/jwt.constant';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { SignOptions, VerifyErrors } from 'jsonwebtoken';

@Injectable()
export class JwtService {
    private readonly logger = new Logger(JwtService.name);
    private readonly jwtSecret: string;
    private readonly jwtRefreshSecret: string;
    private readonly jwtAccessExpire: number | `${number}${'s' | 'm' | 'h' | 'd'}`;
    private readonly jwtRefreshExpire: number | `${number}${'s' | 'm' | 'h' | 'd'}`;

    constructor(private readonly configService: ConfigService) {
        this.jwtSecret = this.getEnv('JWT_SECRET');
        this.jwtRefreshSecret = this.getEnv('JWT_REFRESH_SECRET');
        this.jwtAccessExpire = this.parseExpire(this.getEnv('JWT_EXPIRES_IN'));
        this.jwtRefreshExpire = this.parseExpire(this.getEnv('JWT_REFRESH_EXPIRES_IN'));
    }

    private getEnv(key: string): string {
        const value = this.configService.get<string>(key);
        if (!value) throw new Error(`Missing environment variable: ${key}`);
        return value;
    }

    private isDurationFormat(value: string): value is `${number}${'s' | 'm' | 'h' | 'd'}` {
        return /^\d+(s|m|h|d)$/.test(value);
    }

    private parseExpire(value: string): number | `${number}${'s' | 'm' | 'h' | 'd'}` {
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) return numeric;
        if (this.isDurationFormat(value)) return value;
        throw new Error(`Invalid token expiration: ${value}`);
    }

    private isJwtPayload(obj: unknown): obj is JwtPayload {
        if (typeof obj !== 'object' || obj === null) return false;
        const o = obj as Record<string, unknown>;
        if (typeof o.id !== 'string') return false;
        if ('email' in o && typeof o.email !== 'string') return false;
        if ('role' in o && typeof o.role !== 'string') return false;
        return true;
    }

    private sanitizePayload(payload: Partial<JwtPayload>): JwtPayload {
        if (!payload || typeof payload !== 'object') {
            throw new UnauthorizedException('Invalid JWT payload format');
        }

        const { id, email, role } = payload;

        if (!id || typeof id !== 'string') {
            throw new UnauthorizedException('Missing or invalid "id" in JWT payload');
        }

        if (email && typeof email !== 'string') {
            throw new UnauthorizedException('Invalid "email" in JWT payload');
        }

        const validRoles = Object.values(UserRole);
        if (!role || !validRoles.includes(role)) {
            throw new UnauthorizedException('Invalid or missing "role" in JWT payload');
        }

        return {
            id: id.trim(),
            email: email?.trim() ?? '',
            role,
        };
    }


    generateAccessToken(payload: JwtPayload): string {
        const cleanPayload = this.sanitizePayload(payload);
        const options: SignOptions = {
            expiresIn: this.jwtAccessExpire,
            issuer: JWT_ISSUER,
            subject: payload.id.toString(),
            audience: JWT_AUDIENCE,
        };
        return jwt.sign(cleanPayload, this.jwtSecret, options);
    }

    generateRefreshToken(payload: JwtPayload): string {
        const cleanPayload = this.sanitizePayload(payload);
        const options: SignOptions = {
            expiresIn: this.jwtRefreshExpire,
            issuer: JWT_ISSUER,
            subject: payload.id.toString(),
            audience: JWT_AUDIENCE,
        };
        return jwt.sign(cleanPayload, this.jwtRefreshSecret, options);
    }

    verifyAccessToken(token: string): JwtPayload {
        return this.verify(token, this.jwtSecret, 'ACCESS');
    }

    verifyRefreshToken(token: string): JwtPayload {
        return this.verify(token, this.jwtRefreshSecret, 'REFRESH');
    }

    private verify(token: string, secret: string, type: 'ACCESS' | 'REFRESH'): JwtPayload {
        try {
            const decoded = jwt.verify(token, secret);
            if (!this.isJwtPayload(decoded)) {
                throw new UnauthorizedException({
                    code: `INVALID_${type}_TOKEN_PAYLOAD`,
                    message: `Invalid ${type.toLowerCase()} token payload`,
                });
            }
            return decoded;
        } catch (err) {
            const message = (err as VerifyErrors)?.message ?? 'Token verification failed';
            this.logger.warn(`${type} token invalid: ${message}`);
            throw new UnauthorizedException({
                code: `INVALID_${type}_TOKEN`,
                message: `${type} token is invalid or expired`,
            });
        }
    }

    extractTokenFromHeader(authHeader?: string): string | null {
        if (!authHeader) return null;
        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' && token ? token : null;
    }
}
