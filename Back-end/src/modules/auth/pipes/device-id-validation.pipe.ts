import {
    BadRequestException,
    Injectable,
    PipeTransform
} from '@nestjs/common';
import { AUTH_ERROR_CODES, DEVICE_ID_PATTERN } from '../constants';

@Injectable()
export class DeviceIdValidationPipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value || value.trim().length === 0) {
            throw new BadRequestException({
                code: AUTH_ERROR_CODES.INVALID_DEVICE_ID,
                message: 'Device ID is required and must not be empty',
            });
        }

        if (!DEVICE_ID_PATTERN.test(value)) {
            throw new BadRequestException({
                code: AUTH_ERROR_CODES.INVALID_DEVICE_ID,
                message: 'Device ID contains invalid characters',
            });
        }

        if (value.length > 255) {
            throw new BadRequestException({
                code: AUTH_ERROR_CODES.INVALID_DEVICE_ID,
                message: 'Device ID too long (max 255 characters)',
            });
        }

        return value;
    }
}