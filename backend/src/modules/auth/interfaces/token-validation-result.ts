export interface TokenValidationResult {
    isValid: boolean;
    tokenId?: string;
    shouldRevokeAll?: boolean;
}