import type { ApiResponse } from '@book-club/shared';
import express from 'express';

export const createApp = () => {
  const app = express();

  app.get('/api/health', (_req, res) => {
    const response: ApiResponse<{ status: string }> = {
      data: {
        status: 'ok',
      },
      error: null,
    };

    res.status(200).json(response);
  });

  return app;
};
