import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as authService from './auth.service.js';
import { AUTH_COOKIE_NAME } from './auth.token.js';

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: env.COOKIE_SECURE,
  path: '/',
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { token, admin } = await authService.login(req.body);

  res.cookie(AUTH_COOKIE_NAME, token, { ...cookieOptions, maxAge: EIGHT_HOURS_MS });
  res.status(200).json({ success: true, data: admin });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
  res.status(200).json({ success: true, data: { message: 'Signed out' } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const admin = await authService.getProfile(req.admin!.id);
  res.status(200).json({ success: true, data: admin });
});
