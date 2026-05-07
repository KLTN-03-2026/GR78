import { ValidationErrorObject } from '@/common/interfaces';
export function flattenValidationErrors(obj: ValidationErrorObject): string[] {
    const messages: string[] = [];

    for (const key in obj) {
        const value = obj[key];

        if (typeof value === 'string') {
            messages.push(value);
        } else if (Array.isArray(value)) {
            messages.push(...value.filter((v): v is string => typeof v === 'string'));
        } else if (typeof value === 'object' && value !== null) {
            messages.push(...flattenValidationErrors(value));
        }
    }

    return messages;
}