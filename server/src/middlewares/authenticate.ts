import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AUTH_COOKIE_NAME, verifyToken } from '../modules/auth/auth.token.js';
import { AppError } from '../utils/AppError.js';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

  if (!token) {
    next(AppError.unauthorized());
    return;
  }

  let adminId: string;

  try {
    adminId = verifyToken(token).sub;
  } catch {
    next(AppError.unauthorized('Session expired, please sign in again'));
    return;
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true },
    });

    if (!admin) {
      next(AppError.unauthorized('This account no longer has access'));
      return;
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};
