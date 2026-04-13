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
      })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .get();

    done(null, user ?? false);
  } catch (error) {
    done(error);
  }
});

export const passportInstance = passport;
