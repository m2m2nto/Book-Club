import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../db/client.js';
import { resetDatabase } from '../db/test-cleanup.js';
import {
  bookSurveysTable,
  booksTable,
  meetingsTable,
  rsvpsTable,
  usersTable,
} from '../db/schema.js';
import { dashboardRouter } from './dashboard.js';

const createApp = (user: Express.User) => {
  const app = express();
  app.use((req, _res, next) => {
    const request = req as typeof req & { user: Express.User };
    const isAuthenticated = function (
      this: typeof req,
    ): this is typeof req & { user: Express.User } {
      return true;
    };
    request.isAuthenticated = isAuthenticated;
    request.user = user;
    next();
  });
  app.use('/api/dashboard', dashboardRouter);
  return app;
};

describe('dashboardRouter', () => {
  beforeEach(() => resetDatabase());

  it('returns dashboard data for a member', async () => {
    const [admin, member] = db
      .insert(usersTable)
      .values([
        {
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin',
          active: true,
        },
        {
          email: 'member@example.com',
          name: 'Member',
          role: 'user',
          active: true,
        },
      ])
      .returning()
      .all();

    const book = db
      .insert(booksTable)
      .values({ title: 'Dune', author: 'Frank Herbert', status: 'reading' })
      .returning()
      .get();
    const meeting = db
      .insert(meetingsTable)
      .values({
        date: '2099-12-20',
        time: '19:00',
        location: 'Library',
        bookId: book.id,
        status: 'scheduled',
      })
      .returning()
      .get();
    db.insert(bookSurveysTable)
      .values({
        title: 'Vote',
        maxVotes: 1,
        closesAt: '2099-12-10T10:00:00.000Z',
        createdByUserId: admin!.id,
        status: 'open',
      })
      .run();
    db.insert(rsvpsTable)
      .values({
        meetingId: meeting.id,
        userId: member!.id,
        status: 'yes',
        respondedAt: new Date().toISOString(),
      })
      .run();

    const response = await request(createApp({ ...member! })).get(
      '/api/dashboard',
    );

    expect(response.status).toBe(200);
    expect(response.body.data.nextMeeting.id).toBe(meeting.id);
    expect(response.body.data.myRsvp.status).toBe('yes');
  });
});
