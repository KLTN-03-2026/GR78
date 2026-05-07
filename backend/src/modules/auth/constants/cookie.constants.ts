export const COOKIE_NAMES = {
    REFRESH_TOKEN: 'refreshToken',
} as const;

export const COOKIE_OPTIONS = {
    REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
} as const;