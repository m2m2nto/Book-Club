import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../db/client.js';
import { resetDatabase } from '../db/test-cleanup.js';
import { booksTable, usersTable } from '../db/schema.js';
import { dateSurveysRouter } from './date-surveys.js';
import { meetingsRouter } from './meetings.js';

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
  app.use('/api/meetings', meetingsRouter);
  app.use('/api/date-surveys', dateSurveysRouter);
  return app;
};

describe('meetings and date surveys', () => {
  let adminUser: Express.User;
  let memberUser: Express.User;
  let memberTwo: Express.User;
  let bookId: number;

  beforeEach(() => {
    resetDatabase();

    const insertedUsers = db
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

    adminUser = { ...insertedUsers[0]! };
    memberUser = { ...insertedUsers[1]! };
    memberTwo = { ...insertedUsers[2]! };

    const book = db
      .insert(booksTable)
      .values({
        title: 'Dune',
        author: 'Frank Herbert',
        status: 'pipeline',
        suggestedByUserId: adminUser.id,
      })
      .returning()
      .get();
    bookId = book.id;
  });

  it('supports meeting CRUD and RSVP flow', async () => {
    const adminApp = createApp(adminUser);
    const memberApp = createApp(memberUser);

    const createResponse = await request(adminApp).post('/api/meetings').send({
      date: '2099-12-01',
      time: '19:30',
      location: 'Library Room',
      bookId,
    });

    expect(createResponse.status).toBe(201);
    const meetingId = createResponse.body.data.id;

    const rsvpResponse = await request(memberApp)
      .put(`/api/meetings/${meetingId}/rsvp`)
      .send({ status: 'yes' });
    expect(rsvpResponse.status).toBe(200);

    const detailResponse = await request(memberApp).get(
      `/api/meetings/${meetingId}`,
    );
    expect(detailResponse.body.data.rsvpCounts.yes).toBe(1);

    const patchResponse = await request(adminApp)
      .patch(`/api/meetings/${meetingId}`)
      .send({ recap: 'Great conversation', status: 'completed' });
    expect(patchResponse.body.data.recap).toBe('Great conversation');

    const listResponse = await request(memberApp).get('/api/meetings');
    expect(listResponse.body.data).toHaveLength(1);
  });

  it('prevents RSVP on cancelled meetings', async () => {
    const adminApp = createApp(adminUser);
    const memberApp = createApp(memberUser);

    const meeting = (
      await request(adminApp).post('/api/meetings').send({
        date: '2099-12-02',
        time: '20:00',
        location: 'Cafe',
        bookId: null,
      })
    ).body.data;
    await request(adminApp).delete(`/api/meetings/${meeting.id}`);

    const response = await request(memberApp)
      .put(`/api/meetings/${meeting.id}/rsvp`)
      .send({ status: 'maybe' });
    expect(response.status).toBe(422);
  });

  it('supports date survey voting and meeting confirmation', async () => {
    const adminApp = createApp(adminUser);
    const memberApp = createApp(memberUser);
    const memberTwoApp = createApp(memberTwo);

    const survey = (
      await request(adminApp)
        .post('/api/date-surveys')
        .send({
          title: 'December meeting',
          closesAt: new Date(Date.now() + 3600_000).toISOString(),
          dates: ['2099-12-10', '2099-12-11'],
          time: '19:00',
          location: 'Online',
          bookId,
        })
    ).body.data;

    const firstOptionId = survey.options[0].id;
    const secondOptionId = survey.options[1].id;

    await request(memberApp)
      .post(`/api/date-surveys/${survey.id}/vote`)
      .send({ optionIds: [firstOptionId, secondOptionId] });
    await request(memberTwoApp)
      .post(`/api/date-surveys/${survey.id}/vote`)
      .send({ optionIds: [firstOptionId] });

    const closeResponse = await request(adminApp)
      .patch(`/api/date-surveys/${survey.id}/close`)
      .send({ optionId: firstOptionId });
    expect(closeResponse.status).toBe(200);
    expect(closeResponse.body.data.status).toBe('closed');

    const meetings = await request(memberApp).get('/api/meetings');
    expect(meetings.body.data).toHaveLength(1);
    expect(meetings.body.data[0].date).toBe('2099-12-10');
  });
});
