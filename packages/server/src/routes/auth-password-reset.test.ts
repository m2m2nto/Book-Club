import { and, eq } from 'drizzle-orm';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAuthToken } from '../auth/reset-tokens.js';
import { verifyPassword } from '../auth/password-auth.js';
import { createApp } from '../app.js';
import { db } from '../db/client.js';
import { authTokensTable, usersTable } from '../db/schema.js';
import { resetDatabase } from '../db/test-cleanup.js';

const loginAsAdmin = async (agent: ReturnType<typeof request.agent>) => {
  await agent.get('/auth/test-login?email=admin@example.com');
  const csrfResponse = await agent.get('/auth/csrf');
  return csrfResponse.body.data.csrfToken as string;
};

describe('password reset and invite flows', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('allows an admin to send an invite link', async () => {
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

    const member = db
      .insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
        role: 'user',
        active: true,
      })
      .returning()
      .get();

    const app = createApp();
    const agent = request.agent(app);
    const csrfToken = await loginAsAdmin(agent);

    const response = await agent
      .post(`/api/users/${member.id}/send-invite`)
      .set('x-csrf-token', csrfToken)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.data.success).toBe(true);
    expect(response.body.data.resetUrl).toMatch(/reset-password\?token=/);

    const token = db
      .select()
      .from(authTokensTable)
      .where(
        and(
          eq(authTokensTable.userId, member.id),
          eq(authTokensTable.type, 'invite'),
        ),
      )
      .get();

    expect(token?.createdByUserId).toBe(admin.id);
  });

  it('returns a generic forgot-password response without enumerating accounts', async () => {
    const app = createApp();

    db.insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
        role: 'user',
        active: true,
      })
      .run();

    const existingAgent = request.agent(app);
    const existingCsrf = await existingAgent.get('/auth/csrf');
    const existingResponse = await existingAgent
      .post('/auth/forgot-password')
      .set('x-csrf-token', existingCsrf.body.data.csrfToken)
      .send({ email: 'member@example.com' });

    expect(existingResponse.status).toBe(200);
    expect(existingResponse.body.data.success).toBe(true);

    const missingAgent = request.agent(app);
    const missingCsrf = await missingAgent.get('/auth/csrf');
    const missingResponse = await missingAgent
      .post('/auth/forgot-password')
      .set('x-csrf-token', missingCsrf.body.data.csrfToken)
      .send({ email: 'missing@example.com' });

    expect(missingResponse.status).toBe(200);
    expect(missingResponse.body.data.message).toMatch(/if that account exists/i);

    const tokens = db.select().from(authTokensTable).all();
    expect(tokens).toHaveLength(1);
    expect(tokens[0]?.type).toBe('password-reset');
  });

  it('resets a password from an invite token and consumes the token', async () => {
    const user = db
      .insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
        active: true,
      })
      .returning()
      .get();

    const token = createAuthToken({ userId: user.id, type: 'invite' });
    const app = createApp();
    const agent = request.agent(app);
    const csrfResponse = await agent.get('/auth/csrf');

    const response = await agent
      .post('/auth/reset-password')
      .set('x-csrf-token', csrfResponse.body.data.csrfToken)
      .send({ token: token.rawToken, password: 'fresh-pass-22' });

    expect(response.status).toBe(200);

    const updatedUser = db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .get();

    expect(updatedUser?.passwordHash).toBeTruthy();
    expect(await verifyPassword('fresh-pass-22', updatedUser!.passwordHash!)).toBe(
      true,
    );

    const storedToken = db
      .select()
      .from(authTokensTable)
      .where(eq(authTokensTable.userId, user.id))
      .get();
    expect(storedToken?.consumedAt).toBeTruthy();
  });

  it('rejects expired and reused reset tokens', async () => {
    const user = db
      .insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
        active: true,
      })
      .returning()
      .get();

    const expiredToken = createAuthToken({
      userId: user.id,
      type: 'password-reset',
    });
    db.update(authTokensTable)
      .set({ expiresAt: '2000-01-01T00:00:00.000Z' })
      .where(eq(authTokensTable.userId, user.id))
      .run();

    const validToken = createAuthToken({ userId: user.id, type: 'password-reset' });
    const app = createApp();

    const expiredAgent = request.agent(app);
    const expiredCsrf = await expiredAgent.get('/auth/csrf');
    const expiredResponse = await expiredAgent
      .post('/auth/reset-password')
      .set('x-csrf-token', expiredCsrf.body.data.csrfToken)
      .send({ token: expiredToken.rawToken, password: 'fresh-pass-22' });

    expect(expiredResponse.status).toBe(400);
    expect(expiredResponse.body.error.code).toBe('RESET_TOKEN_INVALID');

    const firstUseAgent = request.agent(app);
    const firstUseCsrf = await firstUseAgent.get('/auth/csrf');
    const firstUseResponse = await firstUseAgent
      .post('/auth/reset-password')
      .set('x-csrf-token', firstUseCsrf.body.data.csrfToken)
      .send({ token: validToken.rawToken, password: 'fresh-pass-22' });
    expect(firstUseResponse.status).toBe(200);

    const secondUseAgent = request.agent(app);
    const secondUseCsrf = await secondUseAgent.get('/auth/csrf');
    const secondUseResponse = await secondUseAgent
      .post('/auth/reset-password')
      .set('x-csrf-token', secondUseCsrf.body.data.csrfToken)
      .send({ token: validToken.rawToken, password: 'fresh-pass-33' });
    expect(secondUseResponse.status).toBe(400);
    expect(secondUseResponse.body.error.code).toBe('RESET_TOKEN_INVALID');
  });
});
