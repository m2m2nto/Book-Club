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
  emailReminderOptOut: integer('email_reminder_opt_out', { mode: 'boolean' })
    .notNull()
    .default(false),
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

export const bookSurveysTable = sqliteTable('book_surveys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  maxVotes: integer('max_votes').notNull().default(1),
  closesAt: text('closes_at').notNull(),
  createdByUserId: integer('created_by_user_id')
    .notNull()
    .references(() => usersTable.id),
  status: text('status', {
    enum: ['open', 'closed', 'tie-break-required'],
  })
    .notNull()
    .default('open'),
  resolvedByUserId: integer('resolved_by_user_id').references(
    () => usersTable.id,
  ),
  resolvedBookId: integer('resolved_book_id').references(() => booksTable.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const bookSurveyOptionsTable = sqliteTable('book_survey_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  surveyId: integer('survey_id')
    .notNull()
    .references(() => bookSurveysTable.id),
  bookId: integer('book_id')
    .notNull()
    .references(() => booksTable.id),
});

export const bookSurveyVotesTable = sqliteTable(
  'book_survey_votes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    surveyId: integer('survey_id')
      .notNull()
      .references(() => bookSurveysTable.id),
    surveyOptionId: integer('survey_option_id')
      .notNull()
      .references(() => bookSurveyOptionsTable.id),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id),
    rank: integer('rank').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    surveyUserRankUnique: uniqueIndex('book_survey_vote_unique').on(
      table.surveyId,
      table.userId,
      table.rank,
    ),
  }),
);

export const meetingsTable = sqliteTable(
  'meetings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    time: text('time').notNull(),
    location: text('location').notNull(),
    bookId: integer('book_id').references(() => booksTable.id),
    status: text('status', { enum: ['scheduled', 'completed', 'cancelled'] })
      .notNull()
      .default('scheduled'),
    recap: text('recap'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    meetingBookUnique: uniqueIndex('meetings_book_unique').on(table.bookId),
  }),
);

export const dateSurveysTable = sqliteTable('date_surveys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  meetingId: integer('meeting_id').references(() => meetingsTable.id),
  title: text('title').notNull(),
  closesAt: text('closes_at').notNull(),
  createdByUserId: integer('created_by_user_id')
    .notNull()
    .references(() => usersTable.id),
  status: text('status', { enum: ['open', 'closed'] })
    .notNull()
    .default('open'),
  time: text('time').notNull(),
  location: text('location').notNull(),
  bookId: integer('book_id').references(() => booksTable.id),
  confirmedOptionId: integer('confirmed_option_id'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const dateSurveyOptionsTable = sqliteTable('date_survey_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dateSurveyId: integer('date_survey_id')
    .notNull()
    .references(() => dateSurveysTable.id),
  proposedDate: text('proposed_date').notNull(),
});

export const dateSurveyVotesTable = sqliteTable(
  'date_survey_votes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    dateSurveyId: integer('date_survey_id')
      .notNull()
      .references(() => dateSurveysTable.id),
    dateSurveyOptionId: integer('date_survey_option_id')
      .notNull()
      .references(() => dateSurveyOptionsTable.id),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    surveyOptionUserUnique: uniqueIndex('date_survey_vote_unique').on(
      table.dateSurveyId,
      table.dateSurveyOptionId,
      table.userId,
    ),
  }),
);

export const rsvpsTable = sqliteTable(
  'rsvps',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    meetingId: integer('meeting_id')
      .notNull()
      .references(() => meetingsTable.id),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id),
    status: text('status', { enum: ['yes', 'no', 'maybe'] }).notNull(),
    respondedAt: text('responded_at'),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    meetingUserUnique: uniqueIndex('rsvp_meeting_user_unique').on(
      table.meetingId,
      table.userId,
    ),
  }),
);

export const reminderDeliveriesTable = sqliteTable(
  'reminder_deliveries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    meetingId: integer('meeting_id')
      .notNull()
      .references(() => meetingsTable.id),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id),
    type: text('type', { enum: ['seven-day', 'one-day'] }).notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    reminderDeliveryUnique: uniqueIndex('reminder_delivery_unique').on(
      table.meetingId,
      table.userId,
      table.type,
    ),
  }),
);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Book = typeof booksTable.$inferSelect;
export type NewBook = typeof booksTable.$inferInsert;
export type Rating = typeof ratingsTable.$inferSelect;
export type Comment = typeof commentsTable.$inferSelect;
export type BookSurvey = typeof bookSurveysTable.$inferSelect;
export type Meeting = typeof meetingsTable.$inferSelect;
export type DateSurvey = typeof dateSurveysTable.$inferSelect;
