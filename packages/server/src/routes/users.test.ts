import { eq } from 'drizzle-orm';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../db/client.js';
import { resetDatabase } from '../db/test-cleanup.js';
import { usersTable } from '../db/schema.js';
import { usersRouter } from './users.js';

const createAdminApp = (adminId = 1) => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    const request = req as typeof req & { user: Express.User };
    const isAuthenticated = function (
      this: typeof req,
    ): this is typeof req & { user: Express.User } {
      return true;
    };

    request.isAuthenticated = isAuthenticated;
    request.user = {
      id: adminId,
      email: 'admin@example.com',
      name: 'Admin',
      avatarUrl: null,
      role: 'admin',
      active: true,
    };
    next();
  });
  app.use('/api/users', usersRouter);
  return app;
};

describe('usersRouter', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('creates and lists users for an admin', async () => {
    const admin = db
      .insert(usersTable)
      .values({
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin',
        active: true,
      })
      .returning()
      .get();

    const app = createAdminApp(admin.id);

    const createResponse = await request(app).post('/api/users').send({
      email: 'member@example.com',
      name: 'Member',
      role: 'user',
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.email).toBe('member@example.com');

    const listResponse = await request(app).get('/api/users');

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(2);
    expect(
      listResponse.body.data.some(
        (user: { email: string }) => user.email === 'member@example.com',
      ),
    ).toBe(true);
  });

  it('soft deletes a user and keeps the row present', async () => {
    const admin = db
      .insert(usersTable)
      .values({
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin',
        active: true,
      })
      .returning()
      .get();

    const inserted = db
      .insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
        role: 'user',
        active: true,
      })
      .returning()
      .get();

    const app = createAdminApp(admin.id);
    const response = await request(app).delete(`/api/users/${inserted.id}`);

    expect(response.status).toBe(200);

    const row = db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, 'member@example.com'))
      .get();
    expect(row?.deletedAt).not.toBeNull();
    expect(row?.active).toBe(false);
  });
});
