import type { ApiResponse } from '@book-club/shared';
import express from 'express';

import { configureGoogleAuth } from './auth/google-auth.js';
import { passportInstance } from './auth/passport.js';
import { sessionMiddleware } from './auth/session.js';
import { env } from './env.js';
import { bookSurveysRouter } from './routes/book-surveys.js';
import { booksRouter } from './routes/books.js';
import { dateSurveysRouter } from './routes/date-surveys.js';
import { meetingsRouter } from './routes/meetings.js';
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

  app.get('/auth/google', (req, res, next) => {
    if (
      !env.googleClientId ||
      !env.googleClientSecret ||
      !env.googleCallbackUrl
    ) {
      res.status(503).json({
        data: null,
        error: {
          code: 'GOOGLE_AUTH_NOT_CONFIGURED',
          message: 'Google OAuth is not configured.',
        },
      });
      return;
    }

    passportInstance.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res, next);
  });

  app.get(
    '/auth/google/callback',
    passportInstance.authenticate('google', {
      failureRedirect: `${env.clientUrl}/login?error=auth_failed`,
      session: true,
    }),
    (_req, res) => {
      res.redirect(env.clientUrl);
    },
  );

  app.post('/auth/logout', (req, res, next) => {
    req.logout((error) => {
      if (error) {
        next(error);
        return;
      }

      req.session.destroy((sessionError) => {
        if (sessionError) {
          next(sessionError);
          return;
        }

        res.clearCookie('connect.sid');
        res.status(200).json({ data: { success: true }, error: null });
      });
    });
  });

  app.get('/auth/me', (req, res) => {
    if (!req.user) {
      res.status(401).json({
        data: null,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
      return;
    }

    res.status(200).json({
      data: req.user,
      error: null,
    });
  });

  app.use('/api/users', usersRouter);
  app.use('/api/books', booksRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/book-surveys', bookSurveysRouter);
  app.use('/api/meetings', meetingsRouter);
  app.use('/api/date-surveys', dateSurveysRouter);

  return app;
};
