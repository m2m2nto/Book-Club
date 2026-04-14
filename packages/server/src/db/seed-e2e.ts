import { resetDatabase } from './test-cleanup.js';
import { db, sqlite } from './client.js';
import { booksTable, usersTable } from './schema.js';

resetDatabase();

const users = db
  .insert(usersTable)
  .values([
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      active: true,
      emailReminderOptOut: false,
    },
    {
      email: 'member@example.com',
      name: 'Member User',
      role: 'user',
      active: true,
      emailReminderOptOut: false,
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
sqlite.close();
