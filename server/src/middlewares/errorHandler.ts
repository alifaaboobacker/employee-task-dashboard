import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../utils/AppError.js';

const uniqueTargetLabel = (target: unknown) => {
  const fields = Array.isArray(target) ? target : typeof target === 'string' ? [target] : [];
  return fields.length > 0 ? fields.join(', ') : 'value';
};

const normalize = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return AppError.conflict(
        `A record with this ${uniqueTargetLabel(error.meta?.target)} already exists`,
      );
    }
    if (error.code === 'P2025') {
      return AppError.notFound('The requested record no longer exists');
    }
    if (error.code === 'P2003') {
      return AppError.badRequest('Related record not found');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return AppError.badRequest('Invalid request payload');
  }

  return new AppError(500, 'Something went wrong', 'INTERNAL_ERROR');
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const normalized = normalize(error);

  if (normalized.statusCode >= 500) {
    logger.error({ err: error, path: req.originalUrl, method: req.method }, 'Unhandled error');
  }

  res.status(normalized.statusCode).json({
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.details ? { details: normalized.details } : {}),
      ...(!env.isProduction && normalized.statusCode >= 500 && error instanceof Error
        ? { stack: error.stack }
        : {}),
    },
  });
};
