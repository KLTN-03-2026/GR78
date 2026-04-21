export const AUTH_HEADERS = {
    DEVICE_ID: 'x-device-id',
    CORRELATION_ID: 'x-correlation-id',
    FORWARDED_FOR: 'x-forwarded-for',
    REAL_IP: 'x-real-ip',
    USER_AGENT: 'user-agent',
} as const;

// export const DEVICE_ID_PATTERN = /^[a-zA-Z0-9-_]{1,255}$/; // production
export const DEVICE_ID_PATTERN = /^[a-zA-Z0-9-_.]{1,255}$/; //for android buid
