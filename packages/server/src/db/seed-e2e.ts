import { hashPassword } from '../auth/password-auth.js';
import { resetDatabase } from './test-cleanup.js';
import { db, sqlite } from './client.js';
import { booksTable, usersTable } from './schema.js';

const run = async () => {
  resetDatabase();

  const adminPasswordHash = await hashPassword('AdminPass123!');
  const memberPasswordHash = await hashPassword('MemberPass123!');
  const now = new Date().toISOString();

  const users = db
    .insert(usersTable)
    .values([
      {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        active: true,
        emailReminderOptOut: false,
        passwordHash: adminPasswordHash,
        passwordSetAt: now,
      },
      {
        email: 'member@example.com',
        name: 'Member User',
        role: 'user',
        active: true,
        emailReminderOptOut: false,
        passwordHash: memberPasswordHash,
        passwordSetAt: now,
      },
    ])
    .returning()
    .all();

  const admin = users[0]!;

  db.insert(booksTable)
    .values([
      {
        title: 'Foundation',
        author: 'Isaac Asimov',
        status: 'wishlist',
        suggestedByUserId: admin.id,
      },
      {
        title: 'Kindred',
        author: 'Octavia E. Butler',
        status: 'wishlist',
        suggestedByUserId: admin.id,
      },
    ])
    .run();

  console.log('E2E seed complete');
};

run()
  .finally(() => sqlite.close())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
