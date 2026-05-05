import { Injectable } from '@nestjs/common';
import { LoginResponseDto, RegisterResponseDto,TokenResponseDto } from '../dtos/auth-response.dto';
import { HealthCheckResponse, LoginResult, RegisterResult, TokenRefreshResult } from '../interfaces';
import { BaseResponseDto} from '@/common/dtos/base-response.dto'

@Injectable()
export class AuthResponseBuilder {
    buildRegisterResponse(result: RegisterResult): RegisterResponseDto {
        return {
            success: true,
            message: 'Registration successful',
            data: result,
        };
    }

    buildLoginResponse(result: LoginResult): LoginResponseDto {
        return {
            success: true,
            message: 'Login successful',
            data: {
                accessToken: result.accessToken,
                user: result.user,
            },
        };
    }

    buildLoginMobileResponse(result: LoginResult): LoginResponseDto {
        return {
            success: true,
            message: 'Login successful',
            data: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user,
            },
        };
    }

    buildRefreshResponse(accessToken: string): TokenResponseDto {
        return {
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken,
            },
        };
    }

    buildRefreshMobileResponse(tokens: TokenRefreshResult): TokenResponseDto {
        return {
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }

    buildLogoutResponse(): BaseResponseDto<void> {
        return {
            success: true,
            message: 'Logout successful',
        };
    }

    buildLogoutAllResponse(): BaseResponseDto<void> {
        return {
            success: true,
            message: 'Logged out from all devices successfully',
        };
    }

    buildLogoutDeviceResponse(): BaseResponseDto<void> {
        return {
            success: true,
            message: 'Device logged out successfully',
        };
    }

    buildHealthCheckResponse(): HealthCheckResponse {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
}