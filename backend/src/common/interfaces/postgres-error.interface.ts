export interface PostgresError extends Error {
    code: string;
    constraint?: string;
    detail?: string;
    column?: string;
    table?: string;
}