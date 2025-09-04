/**
 * Bearer Token Authentication Middleware
 * Validates API tokens and extracts user context
 */
import type { Context, Next } from 'hono';
export interface UserContext {
    readonly userId: string;
    readonly email?: string;
    readonly name?: string;
    readonly plan?: 'free' | 'pro' | 'enterprise';
    readonly isValid: boolean;
}
/**
 * Bearer token authentication middleware
 * Validates tokens and adds user context to request
 */
export declare const bearerAuth: () => (c: Context, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
    message?: string | undefined;
    timestamp: string;
}, 401, "json">) | undefined>;
/**
 * Optional bearer auth - doesn't fail if no token provided
 * Used for endpoints that can work with or without authentication
 */
export declare const optionalBearerAuth: () => (c: Context, next: Next) => Promise<void>;
/**
 * Get user context from request
 * Throws error if not authenticated
 */
export declare const getUserContext: (c: Context) => UserContext;
/**
 * Get optional user context from request
 * Returns undefined if not authenticated
 */
export declare const getOptionalUserContext: (c: Context) => UserContext | undefined;
/**
 * Middleware to add CORS headers for token-based auth
 */
export declare const authCors: () => (c: Context, next: Next) => Promise<import("undici-types").Response | undefined>;
//# sourceMappingURL=auth.d.ts.map