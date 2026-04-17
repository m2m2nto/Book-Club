import crypto from 'node:crypto';

import { eq } from 'drizzle-orm';

import { db } from '../db/client.js';
import { usersTable } from '../db/schema.js';
import type { AuthenticatedUser } from './passport.js';

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_COST = 16_384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;

const scryptAsync = (password: string, salt: Buffer) => {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      SCRYPT_KEY_LENGTH,
      {
        N: SCRYPT_COST,
        r: SCRYPT_BLOCK_SIZE,
        p: SCRYPT_PARALLELIZATION,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey as Buffer);
      },
    );
  });
};

export const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(16);
  const derivedKey = await scryptAsync(password, salt);

  return [
    'scrypt',
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    salt.toString('hex'),
    derivedKey.toString('hex'),
  ].join('$');
};

export const verifyPassword = async (
  password: string,
  passwordHash: string,
) => {
  const [algorithm, cost, blockSize, parallelization, saltHex, keyHex] =
    passwordHash.split('$');

  if (
    algorithm !== 'scrypt' ||
    !cost ||
    !blockSize ||
    !parallelization ||
    !saltHex ||
    !keyHex
  ) {
    return false;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const expectedKey = Buffer.from(keyHex, 'hex');

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      expectedKey.length,
      {
        N: Number(cost),
        r: Number(blockSize),
        p: Number(parallelization),
      },
      (error, key) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(key as Buffer);
      },
    );
  });

  if (derivedKey.length !== expectedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedKey, expectedKey);
};

export const getLoginUserByEmail = (email: string) => {
  return db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      avatarUrl: usersTable.avatarUrl,
      passwordHash: usersTable.passwordHash,
      role: usersTable.role,
      active: usersTable.active,
      deletedAt: usersTable.deletedAt,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .get();
};

export const toAuthenticatedUser = (
  user: Pick<
    typeof usersTable.$inferSelect,
    'id' | 'email' | 'name' | 'avatarUrl' | 'role' | 'active'
  >,
): AuthenticatedUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  avatarUrl: user.avatarUrl,
  role: user.role,
  active: user.active,
});
