import { Transactional, TransactionManager } from '@/common/decorators/@Transaction';
import {
    InternalServerException
} from '@/common/exceptions';
import {
    EmailAlreadyExistsException,
    InvalidCredentialsException,
    InvalidTokenException,
    PhoneAlreadyExistsException,
} from '@/modules/auth/exceptions/auth.exception';

import { UserRole } from '@/common/enums/user-role.enum';
import { JwtService } from '@/common/services/jwt.service';
import { ErrorUtil } from '@/common/utils/error.util';
import { ProfileRepository } from '@/modules/profile/repositorys/profile-repository';
import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AUTH_ERROR_CODES } from './constants/auth.constants';
import { LoginDto, LoginMobileDto, RegisterDto } from './dtos/auth.dto';
import { LoginResult } from './interfaces/login.interface';
import { RefreshInput, TokenRefreshResult } from './interfaces/refresh-token.interface';
import { RegisterResult } from './interfaces/register.interface';
import { RevokeRefreshTokenInput } from './interfaces/revoke-refresh-token.interface';
import { toJwtPayload } from './mappers/user-to-jwt-payload.mapper';
import { AuthConfigService } from './services/auth-config.service';
import { AuthenticationFactory } from './services/authentication-factory.service';
import { TokenManagementService } from './services/token-management.service';
import { UserValidationService } from './services/user-validation.service';
import { PasswordUtil } from './utils/password.util';



@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly tokenMgmt: TokenManagementService,
        private readonly userValidation: UserValidationService,
        private readonly authFactory: AuthenticationFactory,
        private readonly authConfig: AuthConfigService,
        private readonly profileRepo: ProfileRepository,
    ) { }

    // REGISTER 
    @Transactional()
    async register(
        data: RegisterDto,
        @TransactionManager() manager?: EntityManager,
    ): Promise<RegisterResult> {
        try {
            const email = data.email?.toLowerCase().trim();
            const phone = data.phone?.trim();
            const fullName = data.fullName?.trim();
            const role = data.role;
            const allowedRoles = [UserRole.CUSTOMER, UserRole.PROVIDER];
            if (!role || !allowedRoles.includes(role)) {
                throw new BadRequestException(
                    `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
                );
            }

            await Promise.all([
                this.userValidation.checkEmailExists(email!, manager),
                this.userValidation.checkPhoneExists(phone!, manager)
            ]);

            const passwordHash = await PasswordUtil.hash(data.password!, this.authConfig.bcryptRounds);

            const user = await this.userValidation.createUser(
                {
                    email,
                    phone,
                    passwordHash,
                    role,
                    isVerified: false,
                    isActive: true,
                },
                manager,
            );

            const profile = await this.profileRepo.createProfile(
                user.id,
                {
                    fullName,
                    displayName: fullName,
                },
                manager,
            );

            this.logger.log(`User registered: ${user.id} with role: ${role},Profile created: ${profile.id}`);

            return {
                id: user.id,
                email: user.email,
                phone: user.phone,
                fullName: profile.fullName
            };
        } catch (error: unknown) {
            if (
                ErrorUtil.isKnownException(
                    error,
                    EmailAlreadyExistsException,
                    PhoneAlreadyExistsException,
                )
            ) {
                throw error;
            }

            const errorMessage = ErrorUtil.getMessage(error);
            const errorStack = ErrorUtil.getStack(error);
            this.logger.error(`Registration failed: ${errorMessage}`, errorStack);

            throw new InternalServerException('Failed to register user');
        }
    }

    // LOGIN (WEB)
    @Transactional()
    async login(
        data: LoginDto,
        @TransactionManager() manager?: EntityManager,
    ): Promise<LoginResult> {
        try {
            const user = await this.userValidation.validateCredentials(
                data.identifier,
                data.password,
                manager,
            );

            this.logger.log(`User authenticated: ${user.id}`);

            return await this.authFactory.createAuthenticationResult(
                user,
                this.authConfig.maxTokensPerUser,
                undefined,
                manager,
            );
        } catch (error: unknown) {
            if (ErrorUtil.isKnownException(error, InvalidCredentialsException)) {
                throw error;
            }

            const errorMessage = ErrorUtil.getMessage(error);
            const errorStack = ErrorUtil.getStack(error);
            this.logger.error(`Login failed: ${errorMessage}`, errorStack);

            throw new InternalServerException('Login failed');
        }
    }

    // LOGIN MOBILE
    @Transactional()
    async loginMobile(
        data: LoginMobileDto & { deviceId: string },
        @TransactionManager() manager?: EntityManager,
    ): Promise<LoginResult> {
        try {
            const user = await this.userValidation.validateCredentials(
                data.identifier,
                data.password,
                manager,
            );

            this.logger.log(`Mobile authentication: ${user.id}`);

            return await this.authFactory.createAuthenticationResult(
                user,
                this.authConfig.maxTokensPerDevice,
                data.deviceId,
                manager,
            );
        } catch (error: unknown) {
            if (ErrorUtil.isKnownException(error)) {
                throw error;
            }

            const errorMessage = ErrorUtil.getMessage(error);
            const errorStack = ErrorUtil.getStack(error);
            this.logger.error(`Mobile login failed: ${errorMessage}`, errorStack);

            throw new InternalServerException('Mobile login failed: ${errorMessage}');
        }
    }

    // REFRESH TOKEN 
    @Transactional()
    async refreshAccessToken(
        data: RefreshInput,
        @TransactionManager() manager?: EntityManager,
    ): Promise<TokenRefreshResult> {
        try {
            if (!data.refreshToken || typeof data.refreshToken !== 'string' || !data.refreshToken.trim()) {
                throw new UnauthorizedException({
                    code: AUTH_ERROR_CODES.REFRESH_TOKEN_MISSING,
                    message: 'Refresh token not found',
                });
            }

            const payload = this.jwtService.verifyRefreshToken(data.refreshToken);

            const validation = await this.tokenMgmt.validateRefreshToken(
                payload.id,
                data.refreshToken,
                data.deviceId,
                manager,
            );

            if (!validation.isValid) {
                if (validation.shouldRevokeAll) {
                    await this.revokeAllUserTokens(payload.id, manager);
                    this.logger.warn(`Potential token reuse detected: ${payload.id}`);

                    throw new UnauthorizedException({
                        code: AUTH_ERROR_CODES.TOKEN_REUSE_DETECTED,
                        message: 'Token reuse detected. All sessions terminated.',
                    });
                }
                throw new InvalidTokenException('Invalid refresh token');
            }

            const user = await this.userValidation.findById(payload.id, manager);
            if (!user) {
                throw new UnauthorizedException({
                    code: AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
                    message: 'User not found',
                });
            }

            const newPayload = toJwtPayload(user);
            const newAccessToken = this.jwtService.generateAccessToken(newPayload);
            const newRefreshToken = this.jwtService.generateRefreshToken(newPayload);

            if (!validation.tokenId) {
                throw new InternalServerException('Token ID is missing');
            }
            await this.tokenMgmt.revokeById(validation.tokenId, manager);

            await this.tokenMgmt.saveRefreshToken(payload.id, newRefreshToken, this.authConfig.refreshTokenExpiry, data.deviceId, manager);

            this.logger.log(`Token refreshed: ${payload.id}`);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error: unknown) {
            if (
                ErrorUtil.isKnownException(
                    error,
                    InvalidTokenException,
                    UnauthorizedException,
                    InternalServerException,
                )
            ) {
                throw error;
            }

            const errorMessage = ErrorUtil.getMessage(error);
            const errorStack = ErrorUtil.getStack(error);
            this.logger.error(`Token refresh failed: ${errorMessage}`, errorStack);

            throw new InternalServerException('Failed to refresh token');
        }
    }

    // REVOKE TOKENS
    async revokeRefreshToken(
        data: RevokeRefreshTokenInput,
    ): Promise<void> {
        try {
            if (!data.refreshToken || typeof data.refreshToken !== 'string' || !data.refreshToken.trim()) {
                throw new UnauthorizedException({
                    code: AUTH_ERROR_CODES.REFRESH_TOKEN_MISSING,
                    message: 'Refresh token not found',
                });
            }

            const payload = this.jwtService.verifyRefreshToken(data.refreshToken);

            const validation = await this.tokenMgmt.validateRefreshToken(payload.id, data.refreshToken, data.deviceId);

            if (validation.isValid && validation.tokenId) {
                await this.tokenMgmt.revokeById(validation.tokenId);
                this.logger.log(`Token revoked: ${payload.id}`);
            } else {
                throw new UnauthorizedException({
                    code: AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
                    message: 'Refresh token already revoked or invalid',
                });
            }
        } catch (error: unknown) {
            if (ErrorUtil.isKnownException(error, UnauthorizedException)) {
                throw error;
            }

            const errorMessage = ErrorUtil.getMessage(error);
            const errorStack = ErrorUtil.getStack(error);
            this.logger.error(`Failed to revoke token: ${errorMessage}`, errorStack);

            throw new InternalServerException('Failed to revoke token');
        }
    }



    async revokeAllUserTokens(
        refreshTokenOrUserId: string,
        manager?: EntityManager,
    ): Promise<void> {
        try {
            let userId: string;

            if (!refreshTokenOrUserId || !refreshTokenOrUserId.trim()) {
                throw new UnauthorizedException({
                    code: AUTH_ERROR_CODES.REFRESH_TOKEN_MISSING,
                    message: 'Refresh token not found',
                });
            }

            try {
                const payload = this.jwtService.verifyRefreshToken(refreshTokenOrUserId);
                userId = payload.id;
            } catch {
                userId = refreshTokenOrUserId;
            }

            await this.tokenMgmt.revokeAllByUserId(userId, manager);
            this.logger.log(`All tokens revoked: user ${userId}`);
        } catch (error: unknown) {
            if (ErrorUtil.isKnownException(error, UnauthorizedException)) {
                throw error;
            }

            const errorMessage = ErrorUtil.getMessage(error);
            const errorStack = ErrorUtil.getStack(error);
            this.logger.error(`Failed to revoke all tokens: ${errorMessage}`, errorStack);

            throw new InternalServerException('Failed to revoke all tokens');
        }
    }

    async revokeAllDeviceTokens(
        refreshToken: string | null,
        deviceId: string,
    ): Promise<void> {
        try {
            if (!refreshToken || typeof refreshToken !== 'string' || !refreshToken.trim()) {
                throw new UnauthorizedException({
                    code: AUTH_ERROR_CODES.REFRESH_TOKEN_MISSING,
                    message: 'Refresh token not found',
                });
            }

            const payload = this.jwtService.verifyRefreshToken(refreshToken);

            await this.tokenMgmt.revokeAllByUserAndDevice(payload.id, deviceId);
            this.logger.log(`All tokens revoked: user ${payload.id}, device: ${deviceId}`);
        } catch (error: unknown) {
            if (ErrorUtil.isKnownException(error, UnauthorizedException)) {
                throw error;
            }

            const errorMessage = ErrorUtil.getMessage(error);
            const errorStack = ErrorUtil.getStack(error);
            this.logger.error(`Failed to revoke device tokens: ${errorMessage}`, errorStack);

            throw new InternalServerException('Failed to revoke device tokens');
        }
    }

}