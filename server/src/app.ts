import path from 'node:path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { globalLimiter } from './middlewares/rateLimiters.js';
import { apiRouter } from './routes.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(
    cors({
      origin: env.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));
  app.use(cookieParser());
  app.use(hpp());
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req: { url?: string }) => req.url === '/api/health' },
    }),
  );
  app.use('/api', globalLimiter, apiRouter);

  // In production the API also serves the built SPA, so the browser sees one
  // origin and the strict same-site auth cookie keeps working.
  if (env.isProduction) {
    const clientDist = path.resolve(import.meta.dirname, '../../client/dist');
    const indexHtml = path.join(clientDist, 'index.html');

    app.use(express.static(clientDist, { index: false, maxAge: '1y' }));

    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) {
        next();
        return;
      }

      res.sendFile(indexHtml, (error) => {
        if (error) next();
      });
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
