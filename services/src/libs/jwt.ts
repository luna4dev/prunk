import jwt from 'jsonwebtoken';
import { IJWTContext } from '../contexts';
import { logError } from './log';
import { PrunkError } from './error';

export interface JWTPayload {
  [key: string]: any;
}

export interface JWTOptions {
  expiresIn?: number;
  issuer?: string;
  audience?: string;
  subject?: string;
  algorithm?: jwt.Algorithm;
  keyid?: string;
  notBefore?: string | number;
  jwtid?: string;
  [key: string]: any;
}

/**
 * Create a new JWT token
 * @param payload - The payload to encode in the JWT
 * @param context - The context containing JWT configuration
 * @param options - Additional JWT options
 * @returns The generated JWT token
 */
export function createJWT<T extends JWTPayload>(
  payload: T,
  context: IJWTContext,
  options: JWTOptions = {}
): string {
  context.startCallStack('createJWT');
  try {
    const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = context;

    if (!JWT_SECRET) {
      throw new PrunkError('JWT_SECRET is required', 500);
    }

    const jwtOptions: jwt.SignOptions = {
      expiresIn: options.expiresIn || '1h',
    };

    // Add optional properties only if they exist
    if (options.issuer || JWT_ISSUER)
      jwtOptions.issuer = options.issuer || JWT_ISSUER;
    if (options.audience || JWT_AUDIENCE)
      jwtOptions.audience = options.audience || JWT_AUDIENCE;
    if (options.subject) jwtOptions.subject = options.subject;

    // Add any additional options that are compatible with jwt.SignOptions
    if (options['algorithm']) jwtOptions.algorithm = options['algorithm'];
    if (options['keyid']) jwtOptions.keyid = options['keyid'];
    if (options['notBefore'])
      jwtOptions.notBefore = options[
        'notBefore'
      ] as jwt.SignOptions['notBefore'];
    if (options['jwtid']) jwtOptions.jwtid = options['jwtid'];

    const token = jwt.sign(payload, JWT_SECRET, jwtOptions);
    return token;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('createJWT error', error, context);
    throw new PrunkError('Failed to create JWT token', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Refresh a JWT token by creating a new one with the same payload
 * @param token - The existing JWT token to refresh
 * @param context - The context containing JWT configuration
 * @param options - Additional JWT options for the new token
 * @returns The new JWT token
 */
export function refreshJWT<T extends JWTPayload>(
  token: string,
  context: IJWTContext,
  options: JWTOptions = {}
): string {
  context.startCallStack('refreshJWT');
  try {
    const { JWT_SECRET } = context;

    if (!JWT_SECRET) {
      throw new PrunkError('JWT_SECRET is required', 500);
    }

    // Decode the token without verification to get the payload
    const decoded = jwt.decode(token) as T;

    if (!decoded) {
      throw new PrunkError('Invalid JWT token', 400);
    }

    // Remove standard JWT claims that should be regenerated
    const { iat, exp, iss, aud, sub, ...payload } = decoded;

    // Create a new token with the same payload but new timestamps
    return createJWT(payload, context, options);
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }
    logError('refreshJWT error', error, context);
    throw new PrunkError('Failed to refresh JWT token', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Validate and decode a JWT token
 * @param token - The JWT token to validate
 * @param context - The context containing JWT configuration
 * @param options - Additional JWT verification options
 * @returns The decoded payload
 */
export function validateJWT<T extends JWTPayload>(
  token: string,
  context: IJWTContext,
  options: jwt.VerifyOptions = {}
): T {
  context.startCallStack('validateJWT');
  try {
    const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = context;

    if (!JWT_SECRET) {
      throw new PrunkError('JWT_SECRET is required', 500);
    }

    const verifyOptions: jwt.VerifyOptions = {
      issuer: options.issuer || JWT_ISSUER,
      audience: options.audience || JWT_AUDIENCE,
      ...options,
    };

    const decoded = jwt.verify(token, JWT_SECRET, verifyOptions) as T;
    return decoded;
  } catch (error) {
    if (error instanceof PrunkError) {
      throw error;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logError('JWT validation error', error, context);
      throw new PrunkError('Invalid JWT token', 401);
    }

    if (error instanceof jwt.TokenExpiredError) {
      logError('JWT expired', error, context);
      throw new PrunkError('JWT token has expired', 401);
    }

    if (error instanceof jwt.NotBeforeError) {
      logError('JWT not before error', error, context);
      throw new PrunkError('JWT token not yet valid', 401);
    }

    logError('validateJWT error', error, context);
    throw new PrunkError('Failed to validate JWT token', 500);
  } finally {
    context.endCallStack();
  }
}

/**
 * Decode a JWT token without verification (for debugging or when verification is not needed)
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export function decodeJWT<T extends JWTPayload>(token: string): T | null {
  try {
    const decoded = jwt.decode(token) as T;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a JWT token is expired without throwing an error
 * @param token - The JWT token to check
 * @param context - The context containing JWT configuration
 * @returns True if the token is expired, false otherwise
 */
export function isJWTExpired(token: string, context: IJWTContext): boolean {
  try {
    validateJWT(token, context);
    return false;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return true;
    }
    return false;
  }
}
