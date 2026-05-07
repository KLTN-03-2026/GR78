import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { COOKIE_NAMES, COOKIE_OPTIONS } from '../constants/cookie.constants';
import { CookieOptions } from '../interfaces';


@Injectable()
export class CookieService {
    private readonly isProduction: boolean;

    constructor(private readonly configService: ConfigService) {
        this.isProduction = this.configService.get('NODE_ENV') === 'production';
    }

    private getCookieOptions(includeMaxAge: boolean = true): CookieOptions {
        const options: CookieOptions = {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: this.isProduction ? 'strict' : 'lax',
            path: '/',
        };

        if (includeMaxAge) {
            options.maxAge = COOKIE_OPTIONS.REFRESH_TOKEN_MAX_AGE;
        }

        return options;
    }

    setRefreshTokenCookie(res: Response, refreshToken?: string): void {
        res.cookie(
            COOKIE_NAMES.REFRESH_TOKEN,
            refreshToken,
            this.getCookieOptions(true),
        );
    }

    clearRefreshTokenCookie(res: Response): void {
        res.clearCookie(
            COOKIE_NAMES.REFRESH_TOKEN,
            this.getCookieOptions(false),
        );
    }

    extractRefreshTokenFromCookie(req: Request): string | null {
        const cookies = req.cookies as Record<string, string> | undefined;
        return cookies?.[COOKIE_NAMES.REFRESH_TOKEN] ?? null;
    }
}