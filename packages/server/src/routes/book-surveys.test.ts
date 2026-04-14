import { eq } from 'drizzle-orm';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../db/client.js';
import {
  bookSurveyOptionsTable,
  bookSurveyVotesTable,
  bookSurveysTable,
  booksTable,
  usersTable,
} from '../db/schema.js';
import { bookSurveysRouter } from './book-surveys.js';
import { wishlistRouter } from './wishlist.js';

const createApp = (user: Express.User) => {
  const app = express();
  app.use(express.json());
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
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/book-surveys', bookSurveysRouter);
  return app;
};

describe('wishlist and book surveys', () => {
  let adminUser: Express.User;
  let memberUser: Express.User;
  let memberTwo: Express.User;

  beforeEach(() => {
    db.delete(bookSurveyVotesTable).run();
    db.delete(bookSurveyOptionsTable).run();
    db.delete(bookSurveysTable).run();
    db.delete(booksTable).run();
    db.delete(usersTable).run();

    const inserted = db
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
        {
          email: 'member2@example.com',
          name: 'Member Two',
          role: 'user',
          active: true,
        },
      ])
      .returning()
      .all();

    adminUser = { ...inserted[0]! };
    memberUser = { ...inserted[1]! };
    memberTwo = { ...inserted[2]! };
  });

  it('allows wishlist suggestion and survey creation', async () => {
    const memberApp = createApp(memberUser);
    const adminApp = createApp(adminUser);

    const wishlistOne = await request(memberApp).post('/api/wishlist').send({
      title: 'Dune',
      author: 'Frank Herbert',
    });
    const wishlistTwo = await request(memberApp).post('/api/wishlist').send({
      title: 'The Left Hand of Darkness',
      author: 'Ursula K. Le Guin',
    });

    expect(wishlistOne.status).toBe(201);
    expect(wishlistTwo.status).toBe(201);

    const surveyResponse = await request(adminApp)
      .post('/api/book-surveys')
      .send({
        title: 'Next pick',
        closesAt: new Date(Date.now() + 3600_000).toISOString(),
        maxVotes: 2,
        bookIds: [wishlistOne.body.data.id, wishlistTwo.body.data.id],
      });

    expect(surveyResponse.status).toBe(201);
    expect(surveyResponse.body.data.options).toHaveLength(2);
  });

  it('supports ranked voting and closes with a pipeline winner', async () => {
    const memberApp = createApp(memberUser);
    const adminApp = createApp(adminUser);
    const otherMemberApp = createApp(memberTwo);

    const dune = (
      await request(memberApp)
        .post('/api/wishlist')
        .send({ title: 'Dune', author: 'Frank Herbert' })
    ).body.data;
    const hyperion = (
      await request(memberApp)
        .post('/api/wishlist')
        .send({ title: 'Hyperion', author: 'Dan Simmons' })
    ).body.data;

    const survey = (
      await request(adminApp)
        .post('/api/book-surveys')
        .send({
          title: 'Vote',
          closesAt: new Date(Date.now() + 3600_000).toISOString(),
          maxVotes: 2,
          bookIds: [dune.id, hyperion.id],
        })
    ).body.data;

    await request(memberApp)
      .post(`/api/book-surveys/${survey.id}/vote`)
      .send({
        votes: survey.options.map((option: { id: number; bookId: number }) => ({
          optionId: option.id,
          rank: option.bookId === dune.id ? 1 : 2,
        })),
      });

    await request(otherMemberApp)
      .post(`/api/book-surveys/${survey.id}/vote`)
      .send({
        votes: [
          {
            optionId: survey.options.find(
              (option: { bookId: number }) => option.bookId === dune.id,
            ).id,
            rank: 1,
          },
        ],
      });

    const closeResponse = await request(adminApp).patch(
      `/api/book-surveys/${survey.id}/close`,
    );
    expect(closeResponse.status).toBe(200);
    expect(closeResponse.body.data.status).toBe('closed');

    const updatedBook = db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, dune.id))
      .get();
    expect(updatedBook?.status).toBe('pipeline');
  });

  it('requires admin tie resolution when top scores are equal', async () => {
    const memberApp = createApp(memberUser);
    const adminApp = createApp(adminUser);

    const dune = (
      await request(memberApp)
        .post('/api/wishlist')
        .send({ title: 'Dune', author: 'Frank Herbert' })
    ).body.data;
    const leftHand = (
      await request(memberApp).post('/api/wishlist').send({
        title: 'The Left Hand of Darkness',
        author: 'Ursula K. Le Guin',
      })
    ).body.data;

    const survey = (
      await request(adminApp)
        .post('/api/book-surveys')
        .send({
          title: 'Tie vote',
          closesAt: new Date(Date.now() + 3600_000).toISOString(),
          maxVotes: 1,
          bookIds: [dune.id, leftHand.id],
        })
    ).body.data;

    await request(createApp(memberUser))
      .post(`/api/book-surveys/${survey.id}/vote`)
      .send({ votes: [{ optionId: survey.options[0].id, rank: 1 }] });

    await request(createApp(memberTwo))
      .post(`/api/book-surveys/${survey.id}/vote`)
      .send({ votes: [{ optionId: survey.options[1].id, rank: 1 }] });

    const closeResponse = await request(adminApp).patch(
      `/api/book-surveys/${survey.id}/close`,
    );
    expect(closeResponse.body.data.status).toBe('tie-break-required');

    const resolvedResponse = await request(adminApp)
      .patch(`/api/book-surveys/${survey.id}/resolve-tie`)
      .send({ bookId: dune.id });
    expect(resolvedResponse.body.data.status).toBe('closed');
  });
});
