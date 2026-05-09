import { JwtService } from '@/common/services/jwt.service';
import { User } from '@/modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { LoginResult } from '../interfaces/login.interface';
import { toJwtPayload } from '../mappers/user-to-jwt-payload.mapper';
import { AuthConfigService } from './auth-config.service';
import { TokenManagementService } from './token-management.service';

@Injectable()
export class AuthenticationFactory {
    constructor(
        private readonly jwtService: JwtService,
        private readonly tokenMgmt: TokenManagementService,
        private readonly authConfig: AuthConfigService,
    ) { }

    async createAuthenticationResult(
        user: User,
        maxTokens: number,
        deviceId: string | undefined,
        manager?: EntityManager,
    ): Promise<LoginResult> {
        const payload = toJwtPayload(user);
        const accessToken = this.jwtService.generateAccessToken(payload);
        const refreshToken = this.jwtService.generateRefreshToken(payload);

        await this.tokenMgmt.enforceTokenLimit(
            user.id,
            maxTokens,
            deviceId,
            manager,
        );

        await this.tokenMgmt.saveRefreshToken(
            user.id,
            refreshToken,
            this.authConfig.refreshTokenExpiry,
            deviceId,
            manager,
        );

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        };
    }
}