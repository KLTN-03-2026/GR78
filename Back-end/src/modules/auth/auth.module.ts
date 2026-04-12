import { CorrelationIdInterceptor } from '@/common/interceptors/correlation-id.interceptor';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { TransactionInterceptor } from '@/common/interceptors/transaction.interceptor';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';

import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';

import { AuthConfigService } from './services/auth-config.service';
import { AuthResponseBuilder } from './services/auth-response-builder.service';
import { AuthenticationFactory } from './services/authentication-factory.service';
import { CookieService } from './services/cookie.service';
import { TokenManagementService } from './services/token-management.service';
import { UserValidationService } from './services/user-validation.service';
import { ProfileModule } from '@/modules/profile/profile.module';
import { ResendMailService } from './services/resend-mail.service';
import { PasswordResetService } from './services/password-reset.service';
import { PasswordResetCleanupService } from './services/password-reset-cleanup.service';



@Module({
    imports: [
        UsersModule,
        ProfileModule,
        TypeOrmModule.forFeature([RefreshToken,PasswordResetToken]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        TokenManagementService,
        UserValidationService,
        AuthenticationFactory,
        AuthConfigService,
        CookieService,
        AuthResponseBuilder,
        RefreshTokenRepository,
        PasswordResetTokenRepository,    
    ResendMailService,              
    PasswordResetService,            
    PasswordResetCleanupService,
        {
            provide: APP_INTERCEPTOR,
            useClass: CorrelationIdInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransactionInterceptor,
        },
    ],
    exports: [AuthService, TokenManagementService,
        UserValidationService,],
})
export class AuthModule { }