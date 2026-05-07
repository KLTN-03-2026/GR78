export interface RequestWithContext {
    url?: string;
    method?: string;
    correlationId?: string;
    user?: {
        id: string;
        email?: string;
        role?: string;
    };
}