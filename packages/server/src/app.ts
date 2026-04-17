import type { ApiResponse } from '@book-club/shared';
import express, { type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { env } from './env.js';
import { passportInstance } from './auth/passport.js';
import { sessionMiddleware } from './auth/session.js';
import { csrfProtection } from './middleware/csrf.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { bookSurveysRouter } from './routes/book-surveys.js';
import { booksRouter } from './routes/books.js';
import { dashboardRouter } from './routes/dashboard.js';
import { dateSurveysRouter } from './routes/date-surveys.js';
import { meetingsRouter } from './routes/meetings.js';
import { statsRouter } from './routes/stats.js';
import { usersRouter } from './routes/users.js';
import { wishlistRouter } from './routes/wishlist.js';

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.nodeEnv === 'test' ? 1_000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.nodeEnv === 'test' ? 5_000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
});

export const createApp = () => {
  const app = express();

  app.use(
    helmet(
      env.nodeEnv === 'production'
        ? {}
        : {
            contentSecurityPolicy: false,
          },
    ),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(sessionMiddleware);
  app.use(passportInstance.initialize());
  app.use(passportInstance.session());
  app.use(csrfProtection);

  app.get('/api/health', (_req, res) => {
    const response: ApiResponse<{ status: string }> = {
      data: {
        status: 'ok',
      },
      error: null,
    };

    res.status(200).json(response);
  });

  app.use('/auth', authRateLimit, authRouter);

  app.use('/api', apiRateLimit);
  app.use('/api/users', usersRouter);
  app.use('/api/books', booksRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/book-surveys', bookSurveysRouter);
  app.use('/api/meetings', meetingsRouter);
  app.use('/api/date-surveys', dateSurveysRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/admin', adminRouter);

  app.use(
    (
      error: unknown,
      _req: Request,
      res: Response,
    ) => {
      const message =
        error instanceof Error && env.nodeEnv !== 'production'
          ? error.message
          : 'Internal server error.';

      if (env.nodeEnv !== 'test') {
        console.error('[server:error]', error);
      }

      const response: ApiResponse<null> = {
        data: null,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message,
        },
      };

      res.status(500).json(response);
    },
  );

  return app;
};
