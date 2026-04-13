import { eq, isNull } from 'drizzle-orm';
import {
  Strategy as GoogleStrategy,
  type Profile,
} from 'passport-google-oauth20';

import { db } from '../db/client.js';
import { env } from '../env.js';
import { usersTable } from '../db/schema.js';
import { passportInstance, type AuthenticatedUser } from './passport.js';

const getEmailFromProfile = (profile: Profile) => {
  return (
    profile.emails?.find((entry) => entry.verified)?.value ??
    profile.emails?.[0]?.value
  );
};

export const findLoginUserByEmail = (email: string) => {
  return db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      avatarUrl: usersTable.avatarUrl,
      role: usersTable.role,
      active: usersTable.active,
      deletedAt: usersTable.deletedAt,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .get();
};

export const completeGoogleLogin = (profile: Profile): AuthenticatedUser => {
  const email = getEmailFromProfile(profile)?.toLowerCase();

  if (!email) {
    throw new Error('Google profile did not include an email address.');
  }

  const user = db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      avatarUrl: usersTable.avatarUrl,
      role: usersTable.role,
      active: usersTable.active,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .get();

  if (!user) {
    throw new Error('Email is not authorized for this book club.');
  }

  const lifecycle = db
    .select({
      deletedAt: usersTable.deletedAt,
      active: usersTable.active,
    })
    .from(usersTable)
    .where(eq(usersTable.id, user.id))
    .get();

  if (!lifecycle || !lifecycle.active || lifecycle.deletedAt) {
    throw new Error('This user account is inactive.');
  }

  const displayName = profile.displayName?.trim() || user.name;
  const avatarUrl = profile.photos?.[0]?.value ?? user.avatarUrl;

  db.update(usersTable)
    .set({
      name: displayName,
      avatarUrl,
    })
    .where(eq(usersTable.id, user.id))
    .run();

  return {
    ...user,
    name: displayName,
    avatarUrl,
  };
};

export const configureGoogleAuth = () => {
  if (
    !env.googleClientId ||
    !env.googleClientSecret ||
    !env.googleCallbackUrl
  ) {
    return;
  }

  passportInstance.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = completeGoogleLogin(profile);
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      },
    ),
  );
};

export const getAuthorizedUsers = () => {
  return db
    .select({
      id: usersTable.id,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(isNull(usersTable.deletedAt))
    .all();
};
