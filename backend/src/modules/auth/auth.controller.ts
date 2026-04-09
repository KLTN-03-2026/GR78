import { BaseResponseDto } from '@/common/dtos/base-response.dto';
import { ErrorResponseDto } from '@/common/dtos/error-response.dto';
import { HealthCheckResponse } from '@/common/tests//health-check-response.interface';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Ip,
    Post,
    Req,
    Res,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiExcludeEndpoint,
    ApiForbiddenResponse,
    ApiHeader,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { DeviceId } from './decorators/device-id.decorator';
import { LoginResponseDto, RegisterResponseDto, TokenResponseDto } from './dtos/auth-response.dto';
import { LoginDto, LoginMobileDto, RefreshTokenDto, RegisterDto } from './dtos/auth.dto';
import {
    ForgotPasswordDto,
    ForgotPasswordResponseDto,
    ResetPasswordDto,
    ResetPasswordResponseDto,
} from './dtos/password-reset.dto';
import { DeviceIdValidationPipe } from './pipes/device-id-validation.pipe';
import { AuthResponseBuilder } from './services/auth-response-builder.service';
import { CookieService } from './services/cookie.service';
import { PasswordResetService } from './services/password-reset.service';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly cookieService: CookieService,
        private readonly responseBuilder: AuthResponseBuilder,
        private readonly passwordResetService: PasswordResetService
    ) { }

    @Get('health')
    @ApiExcludeEndpoint()
    healthCheck(): HealthCheckResponse {
        return this.responseBuilder.buildHealthCheckResponse();
    }



    // REGISTER
    @Post('register')
    @ApiTags('Auth - Common')
    @HttpCode(HttpStatus.CREATED)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Send body: RegisterDto',
    })
    @ApiCreatedResponse({
        description: 'Registration successful',
        type: RegisterResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid registration data',
        type: ErrorResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
        type: ErrorResponseDto,
    })
    @UsePipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )
    async register(
        @Body() bodyRegister: RegisterDto,
    ): Promise<RegisterResponseDto> {
        const result = await this.authService.register(bodyRegister);
        return this.responseBuilder.buildRegisterResponse(result);
    }


    // LOGOUT ALL DEVICES
    @Post('logout-all')
    @ApiTags('Auth - Common')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Logout from all devices',
        description: 'Sent body: bodyRefreshToken, Revoke all refresh tokens for the current user.',
    })
    @ApiOkResponse({
        description: 'Logged out from all devices successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or missing token',
        type: ErrorResponseDto,
    })
    async logoutAll(
        @Req() req: Request,
        @Body('refreshToken') bodyRefreshToken: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<BaseResponseDto<void>> {
        const refreshToken = this.cookieService.extractRefreshTokenFromCookie(req) ?? bodyRefreshToken;

        await this.authService.revokeAllUserTokens(refreshToken);

        this.cookieService.clearRefreshTokenCookie(res);

        return this.responseBuilder.buildLogoutAllResponse();
    }

    // LOGIN WEB
    @Post('login')
    @ApiTags('Auth - Web')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @ApiOperation({
        summary: 'Login (Web)',
        description: 'Send body: LoginDto. Authenticate user via web browser. Refresh token stored in httpOnly cookie.',
    })
    @ApiOkResponse({
        description: 'Login successful',
        type: LoginResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials',
        type: ErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'Account not activated',
        type: ErrorResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
        type: ErrorResponseDto,
    })
    @UsePipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<LoginResponseDto> {
        const result = await this.authService.login(loginDto);

        this.cookieService.setRefreshTokenCookie(res, result.refreshToken);

        return this.responseBuilder.buildLoginResponse(result);
    }


    // REFRESH TOKEN (WEB)
    @Post('refresh')
    @ApiTags('Auth - Web')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @ApiOperation({
        summary: 'Refresh access token (Web)',
        description: 'Do not send body, Do not send header, Sent cookie.',
    })
    @ApiOkResponse({
        description: 'Token refreshed successfully, Do not send body, Do not send header, Refresh token is retrieved from cookie',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or expired refresh token',
        type: ErrorResponseDto,
    })
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<BaseResponseDto<{ accessToken: string }>> {
        const refreshToken = this.cookieService.extractRefreshTokenFromCookie(req);

        const tokens = await this.authService.refreshAccessToken(
            { refreshToken, deviceId: undefined },
        );

        this.cookieService.setRefreshTokenCookie(res, tokens.refreshToken);

        return this.responseBuilder.buildRefreshResponse(tokens.accessToken);
    }
    // LOGOUT (WEB)
    @Post('logout')
    @ApiTags('Auth - Web')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Logout (Web)',
        description: 'Do not send body, Do not send header, Sent cookie. Revoke refresh token and clear cookie',
    })
    @ApiOkResponse({
        description: 'Logout successful',
        schema: {
            example: {
                success: true,
                message: 'Logout successfully',
                data: null
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or missing token',
        type: ErrorResponseDto,
    })
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<BaseResponseDto<void>> {
        const refreshToken = this.cookieService.extractRefreshTokenFromCookie(req);

        await this.authService.revokeRefreshToken({
            refreshToken,
            deviceId: undefined,
        });

        this.cookieService.clearRefreshTokenCookie(res);

        return this.responseBuilder.buildLogoutResponse();
    }


    // LOGIN MOBILE
    @Post('login-mobile')
    @ApiTags('Auth - Mobile')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @ApiOperation({
        summary: 'Login (Mobile)',
        description: 'Sent body: LoginMobileDto, Sent header X-Device-ID mobile',
    })
    @ApiHeader({
        name: 'X-Device-ID',
        description: 'Unique device identifier (UUID recommended)',
        required: true,
    })
    @ApiOkResponse({
        description: 'Login successful (Mobile)',
        type: LoginResponseDto,
        schema: {
            example: {
                success: true,
                message: 'Login successfully',
                data: {
                    accessToken: 'access-token',
                    refreshToken: 'refresh-token',
                    user: {
                        id: 'uuid',
                        phone: '+84987654321',
                        name: 'Van Tin',
                        role: 'CUSTOMER'
                    }
                }
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials',
        type: ErrorResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
        type: ErrorResponseDto,
    })
    @UsePipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )
    async loginMobile(
        @Body() loginDto: LoginMobileDto,
        @DeviceId(DeviceIdValidationPipe) deviceId: string,
    ): Promise<LoginResponseDto> {
        const result = await this.authService.loginMobile({
            ...loginDto,
            deviceId,
        });

        return this.responseBuilder.buildLoginMobileResponse(result);
    }



    // REFRESH TOKEN (MOBILE)
    @Post('refresh-mobile')
    @ApiTags('Auth - Mobile')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @ApiOperation({
        summary: 'Refresh access token (Mobile)',
        description: 'Sent body: RefreshTokenDto, Sent header X-Device-ID mobile.',
    })
    @ApiHeader({
        name: 'X-Device-ID',
        description: 'Unique device identifier',
        required: true,
    })
    @ApiOkResponse({
        description: 'Token refreshed successfully',
        schema: {
            example: {
                success: true,
                message: 'Refresh token successfully',
                data: {
                    accessToken: 'new-access-token',
                    refreshToken: 'new-refresh-token'
                }
            }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or expired refresh token',
        type: ErrorResponseDto,
    })
    async refreshMobile(
        @Body() bodyRefreshToken: RefreshTokenDto,
        @DeviceId(DeviceIdValidationPipe) deviceId: string,
    ): Promise<TokenResponseDto> {
        const tokens = await this.authService.refreshAccessToken({
            ...bodyRefreshToken,
            deviceId,
        });

        return this.responseBuilder.buildRefreshMobileResponse(tokens);
    }


    // LOGOUT (MOBILE)
    @Post('logout-mobile')
    @ApiTags('Auth - Mobile')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Logout (Mobile)',
        description: 'Sent body: RefreshTokenDto, Sent header X-Device-ID mobile. Revoke refresh token for specific device.',
    })
    @ApiHeader({
        name: 'X-Device-ID',
        description: 'Unique device identifier',
        required: true,
    })
    @ApiOkResponse({
        description: 'Logout successful',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or missing token',
        type: ErrorResponseDto,
    })
    async logoutMobile(
        @Body() bodyRefresh: RefreshTokenDto,
        @DeviceId(DeviceIdValidationPipe) deviceId: string,
    ): Promise<BaseResponseDto<void>> {
        await this.authService.revokeRefreshToken({ ...bodyRefresh, deviceId });

        return this.responseBuilder.buildLogoutResponse();
    }


    // LOGOUT DEVICE (MOBILE)
    @Post('logout-device')
    @ApiTags('Auth - Mobile')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Logout specific device (Mobile)',
        description: 'Sent body: refreshToken, Sent header X-Device-ID mobile. Revoke all tokens for a specific device.',
    })
    @ApiHeader({
        name: 'X-Device-ID',
        description: 'Device identifier to logout',
        required: true,
    })
    @ApiOkResponse({
        description: 'Device logged out successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid or missing token',
        type: ErrorResponseDto,
    })
    async logoutDevice(
        @Body('refreshToken') refreshToken: string,
        @DeviceId(DeviceIdValidationPipe) deviceId: string,
    ): Promise<BaseResponseDto<void>> {
        await this.authService.revokeAllDeviceTokens(refreshToken, deviceId);

        return this.responseBuilder.buildLogoutDeviceResponse();
    }




    @Post('forgot-password')
    @ApiTags('Auth - Common')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 900_000 } }) // 3 lần / 15 phút / IP
    @ApiOperation({
        summary: 'Quên mật khẩu',
        description:
            'Gửi email chứa link reset password qua Resend. ' +
            'Luôn trả 200 OK dù email có tồn tại hay không (tránh user enumeration). ' +
            'Rate limit: 3 request / 15 phút.',
    })
    @ApiOkResponse({
        description: 'Yêu cầu được xử lý (không xác nhận email có tồn tại hay không)',
        type: ForgotPasswordResponseDto,
    })
    @ApiTooManyRequestsResponse({ description: 'Quá nhiều yêu cầu, thử lại sau' })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
        type: ErrorResponseDto,
    })
    @UsePipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )
    async forgotPassword(
        @Body() dto: ForgotPasswordDto,
        @Ip() ip: string,
    ): Promise<ForgotPasswordResponseDto> {
        await this.passwordResetService.forgotPassword(dto.email, ip ?? null);
        return {
            success: true,
            message: 'If this email is registered, you will receive a reset link shortly.',
        };
    }

    // ─── RESET PASSWORD ───────────────────────────────────────────────────────────

    @Post('reset-password')
    @ApiTags('Auth - Common')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 900_000 } }) // 5 lần / 15 phút / IP
    @ApiOperation({
        summary: 'Đặt lại mật khẩu',
        description:
            'Xác thực token từ email, cập nhật mật khẩu mới, ' +
            'revoke toàn bộ refresh tokens (đăng xuất tất cả thiết bị), ' +
            'gửi email thông báo qua Resend.',
    })
    @ApiOkResponse({
        description: 'Đặt lại mật khẩu thành công',
        type: ResetPasswordResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Token không hợp lệ / đã dùng / hết hạn / mật khẩu trùng cũ',
        type: ErrorResponseDto,
    })
    @ApiTooManyRequestsResponse({ description: 'Quá nhiều yêu cầu, thử lại sau' })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
        type: ErrorResponseDto,
    })
    @UsePipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )
    async resetPassword(
        @Body() dto: ResetPasswordDto,
        @Ip() ip: string,
    ): Promise<ResetPasswordResponseDto> {
        await this.passwordResetService.resetPassword(dto.token, dto.newPassword, ip ?? null);
        return {
            success: true,
            message: 'Password reset successfully. Please login with your new password.',
        };
    }
}


