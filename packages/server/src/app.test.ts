import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from './app.js';
import { requireAdmin, requireAuth } from './middleware/auth.js';

describe('createApp', () => {
  it('returns a healthy response from /api/health', async () => {
    const app = createApp();

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        status: 'ok',
      },
      error: null,
    });
  });

  it('returns 401 from /auth/me when not authenticated', async () => {
    const app = createApp();

    const response = await request(app).get('/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      data: null,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
      },
    });
  });
});

describe('auth middleware', () => {
  it('returns 401 for protected routes without a user', async () => {
    const app = express();

    app.get('/protected', requireAuth, (_req, res) => {
      res.status(200).json({ data: { ok: true }, error: null });
    });

    const response = await request(app).get('/protected');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 403 for admin routes when the user is not an admin', async () => {
    const app = express();

    app.use((req, _res, next) => {
      const request = req as typeof req & { user: Express.User };
      const isAuthenticated = function (
        this: typeof req,
      ): this is typeof req & { user: Express.User } {
        return true;
      };

      request.isAuthenticated = isAuthenticated;
      request.user = {
        id: 1,
        email: 'member@example.com',
        name: 'Member',
        avatarUrl: null,
        role: 'user',
        active: true,
      };
      next();
    });

    app.get('/admin', requireAdmin, (_req, res) => {
      res.status(200).json({ data: { ok: true }, error: null });
    });

    const response = await request(app).get('/admin');

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
