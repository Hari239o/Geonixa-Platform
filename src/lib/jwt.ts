import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!process.env.JWT_SECRET || JWT_SECRET === 'change_this_secret_in_production') {
  if (process.env.NODE_ENV === 'production') {
    // Fail fast in production to avoid issuing tokens with a weak secret
    throw new Error('JWT_SECRET must be set to a strong value in production');
  } else {
    console.warn('WARNING: Using default JWT secret. Set JWT_SECRET in environment for production.');
  }
}

export function signJwt(payload: object) {
  // Use `as any` to satisfy differing types across jsonwebtoken versions
  return jwt.sign(payload as any, JWT_SECRET as any, { expiresIn: EXPIRES_IN } as SignOptions) as string;
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    return jwt.verify(token as any, JWT_SECRET as any) as T;
  } catch (err) {
    return null;
  }
}
