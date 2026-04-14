import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../db/client.js';
import {
  booksTable,
  commentsTable,
  ratingsTable,
  usersTable,
} from '../db/schema.js';
import { booksRouter } from './books.js';

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
  app.use('/api/books', booksRouter);
  return app;
};

describe('booksRouter', () => {
  let adminUser: Express.User;
  let memberOne: Express.User;
  let memberTwo: Express.User;

  beforeEach(() => {
    db.delete(commentsTable).run();
    db.delete(ratingsTable).run();
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
          email: 'user1@example.com',
          name: 'User One',
          role: 'user',
          active: true,
        },
        {
          email: 'user2@example.com',
          name: 'User Two',
          role: 'user',
          active: true,
        },
      ])
      .returning()
      .all();

    adminUser = {
      id: inserted[0]!.id,
      email: inserted[0]!.email,
      name: inserted[0]!.name,
      avatarUrl: inserted[0]!.avatarUrl,
      role: inserted[0]!.role,
      active: inserted[0]!.active,
    };
    memberOne = {
      id: inserted[1]!.id,
      email: inserted[1]!.email,
      name: inserted[1]!.name,
      avatarUrl: inserted[1]!.avatarUrl,
      role: inserted[1]!.role,
      active: inserted[1]!.active,
    };
    memberTwo = {
      id: inserted[2]!.id,
      email: inserted[2]!.email,
      name: inserted[2]!.name,
      avatarUrl: inserted[2]!.avatarUrl,
      role: inserted[2]!.role,
      active: inserted[2]!.active,
    };
  });

  it('supports admin CRUD and status filtering', async () => {
    const adminApp = createApp(adminUser);

    const createResponse = await request(adminApp).post('/api/books').send({
      title: 'Dune',
      author: 'Frank Herbert',
      status: 'reading',
    });

    expect(createResponse.status).toBe(201);

    const listResponse = await request(adminApp).get(
      '/api/books?status=reading',
    );
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);

    const bookId = createResponse.body.data.id;
    const patchResponse = await request(adminApp)
      .patch(`/api/books/${bookId}`)
      .send({ title: 'Dune Messiah', status: 'read' });

    expect(patchResponse.body.data.title).toBe('Dune Messiah');

    const deleteResponse = await request(adminApp).delete(
      `/api/books/${bookId}`,
    );
    expect(deleteResponse.status).toBe(200);

    const afterDelete = await request(adminApp).get('/api/books');
    expect(afterDelete.body.data).toHaveLength(0);
  });

  it('upserts ratings and hides private notes from other users', async () => {
    const adminApp = createApp(adminUser);
    const createResponse = await request(adminApp).post('/api/books').send({
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      status: 'read',
    });
    const bookId = createResponse.body.data.id;

    const userOneApp = createApp(memberOne);
    const userTwoApp = createApp(memberTwo);

    await request(userOneApp)
      .put(`/api/books/${bookId}/rating`)
      .send({ score: 4 });
    await request(userOneApp)
      .put(`/api/books/${bookId}/rating`)
      .send({ score: 5 });

    const ratingsResponse = await request(userOneApp).get(
      `/api/books/${bookId}/ratings`,
    );
    expect(ratingsResponse.body.data).toHaveLength(1);
    expect(ratingsResponse.body.data[0].score).toBe(5);

    await request(userOneApp)
      .post(`/api/books/${bookId}/comments`)
      .send({ text: 'Private note', isPrivate: true });
    await request(userOneApp)
      .post(`/api/books/${bookId}/comments`)
      .send({ text: 'Public comment', isPrivate: false });

    const viewerComments = await request(userTwoApp).get(
      `/api/books/${bookId}/comments`,
    );
    expect(viewerComments.body.data).toHaveLength(1);
    expect(viewerComments.body.data[0].text).toBe('Public comment');
  });

  it('proxies Open Library search results', async () => {
    const fetchMock = vi.fn(async () => ({
      json: async () => ({
        docs: [
          {
            key: '/works/OL1W',
            title: 'Dune',
            author_name: ['Frank Herbert'],
            cover_i: 123,
            first_sentence: 'A desert epic.',
          },
        ],
      }),
    }));

    vi.stubGlobal('fetch', fetchMock);

    const userApp = createApp(memberOne);
    const response = await request(userApp).get('/api/books/search?q=dune');

    expect(response.status).toBe(200);
    expect(response.body.data[0].title).toBe('Dune');
    expect(fetchMock).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
