import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';

export const AUTH_COOKIE_NAME = 'etd_session';

export interface TokenPayload {
  sub: string;
  email: string;
}

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    issuer: 'etd-api',
    audience: 'etd-admin',
  });

export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: 'etd-api',
    audience: 'etd-admin',
  });

  if (typeof decoded === 'string' || !decoded.sub || typeof decoded.email !== 'string') {
    throw new Error('Malformed token payload');
  }

  return { sub: decoded.sub, email: decoded.email };
};
