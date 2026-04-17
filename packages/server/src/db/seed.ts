import { eq } from 'drizzle-orm';

import { hashPassword } from '../auth/password-auth.js';
import { env } from '../env.js';
import { db, sqlite } from './client.js';
import { usersTable } from './schema.js';

const run = async () => {
  if (!env.adminEmail) {
    throw new Error('ADMIN_EMAIL is required to seed the initial admin user.');
  }

  if (!env.adminPassword || env.adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD with at least 8 characters is required.');
  }

  const passwordHash = await hashPassword(env.adminPassword);
  const now = new Date().toISOString();

  const existing = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, env.adminEmail))
    .get();

  if (existing) {
    db.update(usersTable)
      .set({
        name: env.adminName,
        role: 'admin',
        active: true,
        deletedAt: null,
        passwordHash,
        passwordSetAt: now,
      })
      .where(eq(usersTable.id, existing.id))
      .run();

    console.log(`Ensured admin user exists for ${env.adminEmail}`);
  } else {
    db.insert(usersTable)
      .values({
        email: env.adminEmail,
        name: env.adminName,
        role: 'admin',
        active: true,
        passwordHash,
        passwordSetAt: now,
      })
      .run();

    console.log(`Created admin user for ${env.adminEmail}`);
  }
};

run()
  .finally(() => {
    sqlite.close();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
