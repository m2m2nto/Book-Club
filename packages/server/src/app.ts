import express from 'express';

export const createApp = () => {
  const app = express();

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      data: {
        status: 'ok',
      },
      error: null,
    });
  });

  return app;
};
