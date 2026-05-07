export class ErrorUtil {
    
    static getMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        if (error && typeof error === 'object' && 'message' in error) {
            return String(error.message);
        }
        return 'Unknown error occurred';
    }

    
    static getStack(error: unknown): string | undefined {
        if (error instanceof Error && error.stack) {
            return error.stack;
        }
        return undefined;
    }

    static isKnownException(
        error: unknown,
        ...exceptionTypes: Array<new (...args: any[]) => Error>
    ): boolean {
        if (!error || typeof error !== 'object') {
            return false;
        }

        return exceptionTypes.some((ExceptionType) => error instanceof ExceptionType);
    }
}