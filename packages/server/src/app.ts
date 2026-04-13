import type { ApiResponse } from '@book-club/shared';
import express from 'express';

import { passportInstance } from './auth/passport.js';
import { sessionMiddleware } from './auth/session.js';

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

  return app;
};
