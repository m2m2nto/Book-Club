import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from './app.js';
import { db } from './db/client.js';
import { usersTable } from './db/schema.js';
import { resetDatabase } from './db/test-cleanup.js';
import { requireAdmin, requireAuth } from './middleware/auth.js';

describe('createApp', () => {
  beforeEach(() => {
    resetDatabase();
  });

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

  it('creates a session through /auth/test-login for an active user', async () => {
    db.insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
        role: 'user',
        active: true,
      })
      .run();

    const app = createApp();
    const agent = request.agent(app);

    const loginResponse = await agent.get(
      '/auth/test-login?email=member@example.com',
    );

    expect(loginResponse.status).toBe(302);
    expect(loginResponse.headers.location).toBe('/');

    const meResponse = await agent.get('/auth/me');

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data).toMatchObject({
      email: 'member@example.com',
      name: 'Member',
      role: 'user',
      active: true,
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
