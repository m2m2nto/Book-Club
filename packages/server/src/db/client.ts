import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as schema from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultDatabasePath = path.resolve(__dirname, '../../data/book-club.db');

export const databaseFilePath = process.env.DATABASE_URL ?? defaultDatabasePath;

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });

export const sqlite = new Database(databaseFilePath);
export const db = drizzle(sqlite, { schema });
