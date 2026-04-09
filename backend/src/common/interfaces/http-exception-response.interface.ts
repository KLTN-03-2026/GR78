import { ValidationErrorObject } from './validation-error-object.interface';

export interface HttpExceptionResponse {
    statusCode?: number;
    message?: string | string[] | ValidationErrorObject;
    error?: string;
    code?: string;
    [key: string]: unknown;
}

