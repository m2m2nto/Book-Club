import { eq } from 'drizzle-orm';

import { db, databaseFilePath, sqlite } from './client.js';
import { usersTable } from './schema.js';

const email = `smoke-${Date.now()}@example.com`;

const insertResult = db
  .insert(usersTable)
  .values({
    email,
    name: 'Smoke Test User',
    role: 'user',
    active: true,
  })
  .run();

if (!insertResult.changes) {
  throw new Error('Failed to insert smoke test user.');
}

const selectedUser = db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, email))
  .get();

if (!selectedUser) {
  throw new Error('Failed to select smoke test user.');
}

console.log(
  `Inserted and selected user ${selectedUser.email} in ${databaseFilePath}`,
);

sqlite.close();
