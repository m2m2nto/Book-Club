import type { ApiResponse } from '@book-club/shared';
import express from 'express';

import { configureGoogleAuth } from './auth/google-auth.js';
import { passportInstance } from './auth/passport.js';
import { sessionMiddleware } from './auth/session.js';
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

configureGoogleAuth();

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(sessionMiddleware);
  app.use(passportInstance.initialize());
  app.use(passportInstance.session());

  app.get('/api/health', (_req, res) => {
    const response: ApiResponse<{ status: string }> = {
      data: {
        status: 'ok',
      },
      error: null,
    };

    res.status(200).json(response);
  });

  app.use('/auth', authRouter);

  app.use('/api/users', usersRouter);
  app.use('/api/books', booksRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/book-surveys', bookSurveysRouter);
  app.use('/api/meetings', meetingsRouter);
  app.use('/api/date-surveys', dateSurveysRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/admin', adminRouter);

  return app;
};
