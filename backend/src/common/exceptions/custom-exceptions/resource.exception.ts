import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../base-exception';

export class ResourceNotFoundException extends BaseException {
    constructor(resource: string, identifier: string | number) {
        super(
            'RESOURCE_NOT_FOUND',
            `${resource} with identifier ${identifier} not found`,
            HttpStatus.NOT_FOUND,
            { resource, identifier },
        );
    }
}

export class ResourceAlreadyExistsException extends BaseException {
    constructor(resource: string, field: string, value: unknown) {
        super(
            'RESOURCE_ALREADY_EXISTS',
            `${resource} with ${field} '${value}' already exists`,
            HttpStatus.CONFLICT,
            { resource, field, value },
        );
    }
}