import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable()
export class AuthConfigService {
    private readonly _bcryptRounds: number;
    private readonly _refreshTokenExpiry: number;

    constructor(private readonly configService: ConfigService) {
        this._bcryptRounds = this.configService.get<number>(
            'BCRYPT_ROUNDS',
            AUTH_CONSTANTS.BCRYPT_ROUNDS,
        );
        this._refreshTokenExpiry = this.configService.get<number>(
            'REFRESH_TOKEN_EXPIRY_DAYS',
            AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_DAYS,
        );
    }

    get bcryptRounds(): number {
        return this._bcryptRounds;
    }

    get refreshTokenExpiry(): number {
        return this._refreshTokenExpiry;
    }

    get maxTokensPerUser(): number {
        return AUTH_CONSTANTS.MAX_REFRESH_TOKENS_PER_USER;
    }

    get maxTokensPerDevice(): number {
        return AUTH_CONSTANTS.MAX_REFRESH_TOKENS_PER_DEVICE;
    }
}