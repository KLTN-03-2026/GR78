import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AUTH_HEADERS } from '../constants/header.constants';

export const DeviceId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string | undefined => {
        const request = ctx.switchToHttp().getRequest();
        const deviceId = request.headers[AUTH_HEADERS.DEVICE_ID];

        if (!deviceId) {
            return undefined;
        }

        return Array.isArray(deviceId) ? deviceId[0] : deviceId;
    },
);