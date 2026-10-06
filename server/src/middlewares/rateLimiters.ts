import rateLimit from 'express-rate-limit';

const handlerPayload = (message: string) => ({
  success: false,
  error: { code: 'RATE_LIMITED', message },
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  // Platform health checks poll constantly and would otherwise share the
  // window with real traffic from the same proxy address.
  skip: (req) => req.path === '/health',
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: handlerPayload('Too many requests, please try again later'),
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: handlerPayload('Too many login attempts, please try again in 15 minutes'),
});

export const mutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: handlerPayload('Too many changes submitted, please slow down'),
});
