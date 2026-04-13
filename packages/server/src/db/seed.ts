import { eq } from 'drizzle-orm';

import { db, sqlite } from './client.js';
import { usersTable } from './schema.js';

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminName = process.env.ADMIN_NAME?.trim() || 'Book Club Admin';

if (!adminEmail) {
  throw new Error('ADMIN_EMAIL is required to seed the initial admin user.');
}

const existing = db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, adminEmail))
  .get();

if (existing) {
  db.update(usersTable)
    .set({
      name: adminName,
      role: 'admin',
      active: true,
      deletedAt: null,
    })
    .where(eq(usersTable.id, existing.id))
    .run();

  console.log(`Ensured admin user exists for ${adminEmail}`);
} else {
  db.insert(usersTable)
    .values({
      email: adminEmail,
      name: adminName,
      role: 'admin',
      active: true,
    })
    .run();

  console.log(`Created admin user for ${adminEmail}`);
}

sqlite.close();
