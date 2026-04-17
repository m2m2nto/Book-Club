import crypto from 'node:crypto';

import { and, eq, gt, inArray, isNull } from 'drizzle-orm';

import { db } from '../db/client.js';
import { env } from '../env.js';
import { authTokensTable, usersTable } from '../db/schema.js';

const TOKEN_BYTES = 32;
export const AUTH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

const hashRawToken = (rawToken: string) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

export const createAuthToken = ({
  userId,
  type,
  createdByUserId,
}: {
  userId: number;
  type: 'invite' | 'password-reset';
  createdByUserId?: number;
}) => {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const tokenHash = hashRawToken(rawToken);
  const expiresAt = new Date(Date.now() + AUTH_TOKEN_TTL_MS).toISOString();

  db.delete(authTokensTable)
    .where(
      and(
        eq(authTokensTable.userId, userId),
        eq(authTokensTable.type, type),
        isNull(authTokensTable.consumedAt),
      ),
    )
    .run();

  db.insert(authTokensTable)
    .values({
      userId,
      type,
      tokenHash,
      expiresAt,
      createdByUserId,
    })
    .run();

  return {
    rawToken,
    expiresAt,
  };
};

export const getActiveAuthToken = ({
  rawToken,
  type,
}: {
  rawToken: string;
  type: 'invite' | 'password-reset';
}) => {
  const tokenHash = hashRawToken(rawToken);
  const now = new Date().toISOString();

  return db
    .select({
      id: authTokensTable.id,
      userId: authTokensTable.userId,
      type: authTokensTable.type,
      expiresAt: authTokensTable.expiresAt,
      consumedAt: authTokensTable.consumedAt,
      userEmail: usersTable.email,
      userName: usersTable.name,
      userActive: usersTable.active,
      userDeletedAt: usersTable.deletedAt,
    })
    .from(authTokensTable)
    .innerJoin(usersTable, eq(usersTable.id, authTokensTable.userId))
    .where(
      and(
        eq(authTokensTable.tokenHash, tokenHash),
        eq(authTokensTable.type, type),
        isNull(authTokensTable.consumedAt),
        gt(authTokensTable.expiresAt, now),
      ),
    )
    .get();
};

export const consumeAuthToken = (tokenId: number) => {
  db.update(authTokensTable)
    .set({ consumedAt: new Date().toISOString() })
    .where(eq(authTokensTable.id, tokenId))
    .run();
};

export const revokeActiveAuthTokensForUser = ({
  userId,
  types,
}: {
  userId: number;
  types: Array<'invite' | 'password-reset'>;
}) => {
  db.delete(authTokensTable)
    .where(
      and(
        eq(authTokensTable.userId, userId),
        inArray(authTokensTable.type, types),
        isNull(authTokensTable.consumedAt),
      ),
    )
    .run();
};

export const buildResetPasswordUrl = (rawToken: string) => {
  return `${env.clientUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
};
