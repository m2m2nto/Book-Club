import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../db/client.js';
import { resetDatabase } from '../db/test-cleanup.js';
import {
  booksTable,
  commentsTable,
  ratingsTable,
  usersTable,
} from '../db/schema.js';
import { statsRouter } from './stats.js';

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
  app.use('/api/stats', statsRouter);
  return app;
};

describe('statsRouter', () => {
  beforeEach(() => resetDatabase());

  it('returns club and personal stats', async () => {
    const [member] = db
      .insert(usersTable)
      .values([
        {
          email: 'member@example.com',
          name: 'Member',
          role: 'user',
          active: true,
        },
      ])
      .returning()
      .all();
    const dune = db
      .insert(booksTable)
      .values({
        title: 'Dune',
        author: 'Frank Herbert',
        status: 'read',
        dateRead: '2024-05-10',
      })
      .returning()
      .get();
    const leftHand = db
      .insert(booksTable)
      .values({
        title: 'Left Hand',
        author: 'Ursula',
        status: 'read',
        dateRead: '2025-02-01',
      })
      .returning()
      .get();
    db.insert(ratingsTable)
      .values([
        { bookId: dune.id, userId: member!.id, score: 5 },
        { bookId: leftHand.id, userId: member!.id, score: 4 },
      ])
      .run();
    db.insert(commentsTable)
      .values({
        bookId: dune.id,
        userId: member!.id,
        text: 'Great',
        isPrivate: false,
      })
      .run();

    const app = createApp({ ...member! });
    const club = await request(app).get('/api/stats/club');
    const me = await request(app).get('/api/stats/me');

    expect(club.status).toBe(200);
    expect(club.body.data.booksPerYear).toHaveLength(2);
    expect(me.body.data.booksRated).toBe(2);
    expect(me.body.data.commentCount).toBe(1);
  });
});
