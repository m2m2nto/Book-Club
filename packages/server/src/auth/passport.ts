import { eq } from 'drizzle-orm';
import passport from 'passport';

import { db } from '../db/client.js';
import { usersTable, type User } from '../db/schema.js';

export type AuthenticatedUser = Pick<
  User,
  'id' | 'email' | 'name' | 'avatarUrl' | 'role' | 'active'
>;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: number, done) => {
  try {
    const user = db
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
      .where(eq(usersTable.id, id))
      .get();

    if (!user || !user.active || user.deletedAt) {
      done(null, false);
      return;
    }

    done(null, {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      active: user.active,
    });
  } catch (error) {
    done(error);
  }
});

export const passportInstance = passport;
