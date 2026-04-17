import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { hashPassword } from './auth/password-auth.js';
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

  it('creates a session through /auth/login for an active user with a password', async () => {
    db.insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
        role: 'user',
        active: true,
        passwordHash: await hashPassword('hunter22!'),
        passwordSetAt: '2026-04-17T10:00:00.000Z',
      })
      .run();

    const app = createApp();
    const agent = request.agent(app);
    const csrfResponse = await agent.get('/auth/csrf');

    const loginResponse = await agent
      .post('/auth/login')
      .set('x-csrf-token', csrfResponse.body.data.csrfToken)
      .send({ email: 'member@example.com', password: 'hunter22!' });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.user).toMatchObject({
      email: 'member@example.com',
      name: 'Member',
      role: 'user',
      active: true,
    });

    const meResponse = await agent.get('/auth/me');

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data).toMatchObject({
      email: 'member@example.com',
      name: 'Member',
      role: 'user',
      active: true,
    });
  });

  it('rejects invalid credentials and blocked accounts from /auth/login', async () => {
    const passwordHash = await hashPassword('hunter22!');

    db.insert(usersTable)
      .values([
        {
          email: 'member@example.com',
          name: 'Member',
          role: 'user',
          active: true,
          passwordHash,
          passwordSetAt: '2026-04-17T10:00:00.000Z',
        },
        {
          email: 'inactive@example.com',
          name: 'Inactive',
          role: 'user',
          active: false,
          passwordHash,
          passwordSetAt: '2026-04-17T10:00:00.000Z',
        },
        {
          email: 'deleted@example.com',
          name: 'Deleted',
          role: 'user',
          active: true,
          deletedAt: '2026-04-17T10:00:00.000Z',
          passwordHash,
          passwordSetAt: '2026-04-17T10:00:00.000Z',
        },
      ])
      .run();

    const app = createApp();

    const invalidAgent = request.agent(app);
    const invalidCsrf = await invalidAgent.get('/auth/csrf');
    const invalidResponse = await invalidAgent
      .post('/auth/login')
      .set('x-csrf-token', invalidCsrf.body.data.csrfToken)
      .send({ email: 'member@example.com', password: 'wrong-pass!' });
    expect(invalidResponse.status).toBe(401);
    expect(invalidResponse.body.error.code).toBe('INVALID_CREDENTIALS');

    const inactiveAgent = request.agent(app);
    const inactiveCsrf = await inactiveAgent.get('/auth/csrf');
    const inactiveResponse = await inactiveAgent
      .post('/auth/login')
      .set('x-csrf-token', inactiveCsrf.body.data.csrfToken)
      .send({ email: 'inactive@example.com', password: 'hunter22!' });
    expect(inactiveResponse.status).toBe(401);
    expect(inactiveResponse.body.error.code).toBe('INVALID_CREDENTIALS');

    const deletedAgent = request.agent(app);
    const deletedCsrf = await deletedAgent.get('/auth/csrf');
    const deletedResponse = await deletedAgent
      .post('/auth/login')
      .set('x-csrf-token', deletedCsrf.body.data.csrfToken)
      .send({ email: 'deleted@example.com', password: 'hunter22!' });
    expect(deletedResponse.status).toBe(401);
    expect(deletedResponse.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects state-changing requests without a CSRF token', async () => {
    db.insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
        role: 'user',
        active: true,
        passwordHash: await hashPassword('hunter22!'),
        passwordSetAt: '2026-04-17T10:00:00.000Z',
      })
      .run();

    const app = createApp();
    const agent = request.agent(app);

    const loginCsrf = await agent.get('/auth/csrf');
    await agent
      .post('/auth/login')
      .set('x-csrf-token', loginCsrf.body.data.csrfToken)
      .send({ email: 'member@example.com', password: 'hunter22!' });

    const rejected = await agent.post('/auth/logout');
    expect(rejected.status).toBe(403);
    expect(rejected.body.error.code).toBe('CSRF_TOKEN_INVALID');

    const csrfResponse = await agent.get('/auth/csrf');
    expect(csrfResponse.status).toBe(200);

    const accepted = await agent
      .post('/auth/logout')
      .set('x-csrf-token', csrfResponse.body.data.csrfToken);
    expect(accepted.status).toBe(200);
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
