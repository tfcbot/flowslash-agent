/**
 * Bearer Token Authentication Middleware
 * Validates API tokens and extracts user context
 */

import type { Context, Next } from 'hono';
import { createErrorResponse } from '@/types/simple';

// Simple user context derived from token
export interface UserContext {
  readonly userId: string;
  readonly email?: string;
  readonly name?: string;
  readonly plan?: 'free' | 'pro' | 'enterprise';
  readonly isValid: boolean;
}

// Token validation result
interface TokenValidation {
  readonly isValid: boolean;
  readonly userContext?: UserContext;
  readonly error?: string;
}

/**
 * Bearer token authentication middleware
 * Validates tokens and adds user context to request
 */
export const bearerAuth = () => {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        createErrorResponse(
          'Authentication required',
          'Please provide a valid bearer token in Authorization header'
        ),
        401
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const validation = await validateToken(token);

    if (!validation.isValid || !validation.userContext) {
      return c.json(
        createErrorResponse(
          'Invalid token',
          validation.error || 'Token validation failed'
        ),
        401
      );
    }

    // Add user context to request
    c.set('userContext', validation.userContext);
    
    await next();
  };
};

/**
 * Optional bearer auth - doesn't fail if no token provided
 * Used for endpoints that can work with or without authentication
 */
export const optionalBearerAuth = () => {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const validation = await validateToken(token);

      if (validation.isValid && validation.userContext) {
        c.set('userContext', validation.userContext);
      }
    }
    
    await next();
  };
};

/**
 * Get user context from request
 * Throws error if not authenticated
 */
export const getUserContext = (c: Context): UserContext => {
  const userContext = c.get('userContext') as UserContext;
  
  if (!userContext || !userContext.isValid) {
    throw new Error('User context not available - authentication required');
  }
  
  return userContext;
};

/**
 * Get optional user context from request
 * Returns undefined if not authenticated
 */
export const getOptionalUserContext = (c: Context): UserContext | undefined => {
  return c.get('userContext') as UserContext | undefined;
};

/**
 * Validate bearer token and extract user information
 * 
 * This validates externally managed tokens and extracts userId for API operations.
 * Token format and validation logic should match your external token system.
 */
async function validateToken(token: string): Promise<TokenValidation> {
  try {
    if (!token || token.length < 10) {
      return {
        isValid: false,
        error: 'Token too short - minimum 10 characters required'
      };
    }

    // Extract userId from token - adapt this to your external token format
    let userId: string;
    
    // Method 1: Token format "user_{userId}_{timestamp}_{signature}" 
    if (token.startsWith('user_')) {
      const parts = token.split('_');
      if (parts.length >= 2 && parts[1]) {
        userId = parts[1];
      } else {
        return {
          isValid: false,
          error: 'Invalid token format - cannot extract userId'
        };
      }
    }
    // Method 2: JWT token - decode payload to get userId
    else if (token.includes('.')) {
      try {
        // For JWT tokens, you would decode and extract userId
        // const payload = jwt.decode(token);
        // userId = payload.sub || payload.userId;
        
        // Simplified: Use first 8 chars as userId for demo
        userId = `jwt_${token.substring(0, 8)}`;
      } catch {
        return {
          isValid: false,
          error: 'Invalid JWT token format'
        };
      }
    }
    // Method 3: Opaque API key - generate deterministic userId
    else if (token.length >= 32) {
      userId = `api_${token.substring(0, 8)}`;
    }
    // Method 4: Custom format - adapt as needed
    else {
      return {
        isValid: false,
        error: 'Unsupported token format'
      };
    }

    if (!userId || userId.length < 3) {
      return {
        isValid: false,
        error: 'Could not extract valid userId from token'
      };
    }

    // Create user context from extracted userId
    const userContext: UserContext = {
      userId,
      email: `${userId}@external-auth.com`,
      name: `User ${userId}`,
      plan: 'pro', // Default plan for external tokens
      isValid: true,
    };

    return {
      isValid: true,
      userContext,
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Token generation removed - tokens are managed externally

/**
 * Middleware to add CORS headers for token-based auth
 */
export const authCors = () => {
  return async (c: Context, next: Next) => {
    c.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Handle preflight requests
    if (c.req.method === 'OPTIONS') {
      return new Response('', { status: 204 });
    }
    
    await next();
  };
};
