
export interface RefreshInput {
    refreshToken: string | null,
    deviceId?: string,
}

export interface TokenRefreshResult {
    accessToken: string;
    refreshToken: string;
}