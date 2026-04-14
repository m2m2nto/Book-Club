import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: ['admin', 'user'] })
    .notNull()
    .default('user'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const booksTable = sqliteTable('books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  coverUrl: text('cover_url'),
  description: text('description'),
  openLibraryId: text('open_library_id'),
  status: text('status', { enum: ['wishlist', 'pipeline', 'reading', 'read'] })
    .notNull()
    .default('wishlist'),
  dateRead: text('date_read'),
  suggestedByUserId: integer('suggested_by_user_id').references(
    () => usersTable.id,
  ),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const ratingsTable = sqliteTable(
  'ratings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bookId: integer('book_id')
      .notNull()
      .references(() => booksTable.id),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id),
    score: integer('score').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    bookUserUnique: uniqueIndex('ratings_book_user_unique').on(
      table.bookId,
      table.userId,
    ),
  }),
);

export const commentsTable = sqliteTable(
  'comments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bookId: integer('book_id')
      .notNull()
      .references(() => booksTable.id),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id),
    text: text('text').notNull(),
    isPrivate: integer('is_private', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    bookIndex: index('comments_book_id_idx').on(table.bookId),
  }),
);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Book = typeof booksTable.$inferSelect;
export type NewBook = typeof booksTable.$inferInsert;
export type Rating = typeof ratingsTable.$inferSelect;
export type Comment = typeof commentsTable.$inferSelect;
