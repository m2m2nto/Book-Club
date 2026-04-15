import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { sessionMiddleware } from '../auth/session.js';
import { db } from '../db/client.js';
import { resetDatabase } from '../db/test-cleanup.js';
import { usersTable } from '../db/schema.js';
import { adminRouter } from './admin.js';

const createApp = (user: Express.User) => {
  const app = express();
  app.use(express.json());
  app.use(sessionMiddleware);
  app.use((req, _res, next) => {
    const request = req as typeof req & { user: Express.User };
    const isAuthenticated = function (
      this: typeof req,
    ): this is typeof req & { user: Express.User } {
      return true;
    };
    request.isAuthenticated = isAuthenticated;
    request.user = user;
    next();
  });
  app.use('/api/admin', adminRouter);
  return app;
};

describe('adminRouter', () => {
  beforeEach(() => resetDatabase());

  it('exports the database file for admins after confirmation', async () => {
    const [admin] = db
      .insert(usersTable)
      .values([
        {
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin',
          active: true,
        },
      ])
      .returning()
      .all();

    const agent = request.agent(createApp({ ...admin! }));

    const unconfirmedResponse = await agent.get('/api/admin/export-db');
    expect(unconfirmedResponse.status).toBe(403);

    const confirmationResponse = await agent
      .post('/api/admin/export-db/confirm')
      .send({ confirmed: true });

    expect(confirmationResponse.status).toBe(200);
    expect(confirmationResponse.body.data.downloadUrl).toContain(
      '/api/admin/export-db?token=',
    );

    const response = await agent.get(confirmationResponse.body.data.downloadUrl);
    expect(response.status).toBe(200);
    expect(response.headers['content-disposition']).toContain('.db');
  });
});
