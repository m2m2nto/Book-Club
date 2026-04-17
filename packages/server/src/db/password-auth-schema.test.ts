import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from './client.js';
import { authTokensTable, usersTable } from './schema.js';
import { resetDatabase } from './test-cleanup.js';

describe('password auth schema', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('stores password hashes on users without storing a plaintext password column', () => {
    const user = db
      .insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
        passwordHash: 'hashed-secret',
        passwordSetAt: '2026-04-17T10:00:00.000Z',
      })
      .returning()
      .get();

    expect(user.passwordHash).toBe('hashed-secret');
    expect('password' in user).toBe(false);
  });

  it('enforces unique token hashes for auth tokens', () => {
    const user = db
      .insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
      })
      .returning()
      .get();

    db.insert(authTokensTable)
      .values({
        userId: user.id,
        type: 'invite',
        tokenHash: 'token-hash',
        expiresAt: '2099-12-31T00:00:00.000Z',
      })
      .run();

    expect(() => {
      db.insert(authTokensTable)
        .values({
          userId: user.id,
          type: 'password-reset',
          tokenHash: 'token-hash',
          expiresAt: '2099-12-31T00:00:00.000Z',
        })
        .run();
    }).toThrow();
  });

  it('supports consuming a token exactly once at the data layer', () => {
    const user = db
      .insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
      })
      .returning()
      .get();

    const token = db
      .insert(authTokensTable)
      .values({
        userId: user.id,
        type: 'invite',
        tokenHash: 'consume-me',
        expiresAt: '2099-12-31T00:00:00.000Z',
      })
      .returning()
      .get();

    db.update(authTokensTable)
      .set({ consumedAt: '2026-04-17T12:00:00.000Z' })
      .where(eq(authTokensTable.id, token.id))
      .run();

    const consumed = db
      .select()
      .from(authTokensTable)
      .where(eq(authTokensTable.id, token.id))
      .get();

    expect(consumed?.consumedAt).toBe('2026-04-17T12:00:00.000Z');
  });
});
