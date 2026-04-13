import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import { db, databaseFilePath, sqlite } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.resolve(__dirname, './migrations');

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });

migrate(db, { migrationsFolder });

console.log(`Applied migrations to ${databaseFilePath}`);

sqlite.close();
