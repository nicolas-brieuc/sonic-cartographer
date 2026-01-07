import { Context } from 'hono';
import { Env } from './raindrop.gen';

// CORS headers constant for consistency across the application
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

// In-memory rate limiting store (would use KV store in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Extracts and validates JWT token from Authorization header
 * @param c - Hono context with environment bindings
 * @returns User object with userId if valid, null otherwise
 */
export async function validateToken(
  c: Context<{ Bindings: Env }>
): Promise<{ userId: string } | null> {
  const authHeader = c.req.header('Authorization');

  // Check for Bearer token format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const result = await c.env.AUTH_SERVICE.validateToken(token);
    return result;
  } catch {
    return null;
  }
}

/**
 * Applies CORS headers to an existing response
 * @param response - Original response
 * @returns New response with CORS headers added
 */
export function applyCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // Apply all CORS headers from constant
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Creates standardized error response with CORS headers
 * @param error - Error message
 * @param status - HTTP status code
 * @param details - Optional additional error details
 * @returns Response with error JSON and appropriate headers
 */
export function createErrorResponse(
  error: string,
  status: number,
  details?: string
): Response {
  const body = details ? { error, details } : { error };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Handles JSON parsing errors and other common errors
 * @param error - Error object
 * @param c - Hono context
 * @returns Appropriate error response
 */
export function handleJsonError(error: unknown, c: Context<{ Bindings: Env }>): Response {
  if (error instanceof SyntaxError) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
  return c.json({ error: 'Internal server error' }, 500);
}

/**
 * Checks rate limit for user and endpoint combination
 * Uses sliding window algorithm with in-memory storage
 * @param userId - User identifier
 * @param endpoint - API endpoint path
 * @param env - Environment bindings
 * @returns true if request is allowed, false if rate limit exceeded
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  _env: Env
): Promise<boolean> {
  const key = `${userId}:${endpoint}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  // Create new record if none exists or window expired
  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // Increment counter
  record.count++;
  return true;
}

/**
 * Higher-order function to wrap authenticated routes
 * @param handler - Route handler function
 * @returns Wrapped handler with authentication check
 */
export function withAuth<T>(
  handler: (c: Context<{ Bindings: Env }>, user: { userId: string }) => Promise<T>
) {
  return async (c: Context<{ Bindings: Env }>): Promise<T | Response> => {
    const user = await validateToken(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return handler(c, user);
  };
}
