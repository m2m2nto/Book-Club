import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../db/client.js';
import { resetDatabase } from '../db/test-cleanup.js';
import { usersTable } from '../db/schema.js';
import { adminRouter } from './admin.js';

const createApp = (user: Express.User) => {
  const app = express();
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

  it('exports the database file for admins', async () => {
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
    const response = await request(createApp({ ...admin! })).get(
      '/api/admin/export-db',
    );
    expect(response.status).toBe(200);
    expect(response.headers['content-disposition']).toContain('.db');
  });
});
