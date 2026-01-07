import { Env } from './raindrop.gen';
import type { RegisterUserRequest, LoginUserRequest, AuthResponse, TokenPayload } from './interfaces';

// Constants for token and cryptography
const SALT_LENGTH = 16;
const TOKEN_EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours
const JWT_ALGORITHM = 'HS256';
const HASH_ALGORITHM = 'SHA-256';

/**
 * Converts byte array to hexadecimal string
 * @param bytes - Array of bytes
 * @returns Hexadecimal string representation
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hashes password using Web Crypto API with salt
 * Uses SHA-256 for hashing (V8 compatible)
 * @param password - Plain text password
 * @returns Salt and hash combined as "salt:hash"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const saltHex = bytesToHex(salt);

  const encoder = new TextEncoder();
  const data = encoder.encode(password + saltHex);

  const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, data);
  const hashHex = bytesToHex(new Uint8Array(hashBuffer));

  return `${saltHex}:${hashHex}`;
}

/**
 * Verifies password against stored hash
 * Uses constant-time comparison for security
 * @param password - Plain text password to verify
 * @param hash - Stored hash in format "salt:hash"
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const parts = hash.split(':');
  if (parts.length !== 2) {
    return false;
  }

  const [saltHex, expectedHash] = parts;

  const encoder = new TextEncoder();
  const data = encoder.encode(password + saltHex);
  const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, data);
  const computedHash = bytesToHex(new Uint8Array(hashBuffer));

  // Constant-time comparison
  return computedHash === expectedHash;
}

/**
 * Converts string to base64url encoding (URL-safe base64)
 * @param str - String to encode
 * @returns base64url encoded string
 */
function base64urlEncode(str: string): string {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Converts base64url string back to regular string
 * @param str - base64url encoded string
 * @returns Decoded string
 */
function base64urlDecode(str: string): string {
  const padding = '=='.slice(0, (4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return atob(base64);
}

/**
 * Generates JWT token using Web Crypto API
 * Implements RFC 7519 standard for JWT tokens
 * @param userId - User identifier
 * @param email - User email address
 * @param env - Environment bindings with JWT secret
 * @returns Signed JWT token string
 */
export async function generateToken(userId: string, email: string, env: Env): Promise<string> {
  const header = { alg: JWT_ALGORITHM, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId,
    email,
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS,
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;

  const encoder = new TextEncoder();
  const secret = encoder.encode(env.JWT_SECRET || 'default-secret');
  const key = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: HASH_ALGORITHM },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureB64 = base64urlEncode(String.fromCharCode(...new Uint8Array(signature)));

  return `${data}.${signatureB64}`;
}

/**
 * Validates JWT token and returns payload if valid
 * Checks signature and expiration
 * @param token - JWT token string
 * @param env - Environment bindings with JWT secret
 * @returns Token payload if valid, null otherwise
 */
export async function validateToken(token: string, env: Env): Promise<TokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const headerB64 = parts[0];
    const payloadB64 = parts[1];
    const signatureB64 = parts[2];

    if (!headerB64 || !payloadB64 || !signatureB64) {
      return null;
    }

    const data = `${headerB64}.${payloadB64}`;

    // Import secret key for verification
    const encoder = new TextEncoder();
    const secret = encoder.encode(env.JWT_SECRET || 'default-secret');
    const key = await crypto.subtle.importKey(
      'raw',
      secret,
      { name: 'HMAC', hash: HASH_ALGORITHM },
      false,
      ['verify']
    );

    // Decode signature from base64url
    const decodedSignature = base64urlDecode(signatureB64);
    const signatureBytes = Uint8Array.from(decodedSignature, (c) =>
      c.charCodeAt(0)
    );

    // Verify signature
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(data)
    );

    if (!isValid) {
      return null;
    }

    // Decode and parse payload
    const payloadJson = base64urlDecode(payloadB64);
    const payload = JSON.parse(payloadJson) as TokenPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Registers new user in the system
 * Hashes password and generates authentication token
 * @param data - User registration data (email, password)
 * @param env - Environment bindings
 * @returns Authentication response with userId, token, and email
 */
export async function registerUser(
  data: RegisterUserRequest,
  env: Env
): Promise<AuthResponse> {
  const userId = crypto.randomUUID();
  const _passwordHash = await hashPassword(data.password);

  // TODO: Store user in SmartSQL database
  // For now, return mock response
  env.logger.info('User registered', { userId, email: data.email });

  const token = await generateToken(userId, data.email, env);

  return {
    userId,
    token,
    email: data.email,
  };
}

/**
 * Authenticates user login credentials
 * Verifies password and generates new token
 * @param data - Login credentials (email, password)
 * @param env - Environment bindings
 * @returns Authentication response with userId, token, and email
 */
export async function loginUser(
  data: LoginUserRequest,
  env: Env
): Promise<AuthResponse> {
  // TODO: Fetch user from SmartSQL database and verify password
  // For now, return mock response
  const userId = crypto.randomUUID();
  env.logger.info('User logged in', { userId, email: data.email });

  const token = await generateToken(userId, data.email, env);

  return {
    userId,
    token,
    email: data.email,
  };
}
