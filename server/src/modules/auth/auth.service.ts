import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { signToken } from './auth.token.js';
import type { LoginInput } from './auth.schema.js';

const DUMMY_HASH = bcrypt.hashSync(randomBytes(24).toString('hex'), env.BCRYPT_ROUNDS);

export const login = async ({ email, password }: LoginInput) => {
  const admin = await prisma.admin.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  const passwordMatches = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !passwordMatches) {
    throw AppError.unauthorized('Invalid email or password');
  }

  return {
    token: signToken({ sub: admin.id, email: admin.email }),
    admin: { id: admin.id, name: admin.name, email: admin.email },
  };
};

export const getProfile = async (adminId: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!admin) {
    throw AppError.unauthorized('Account no longer exists');
  }

  return admin;
};
