import { and, asc, avg, desc, eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db/client.js';
import {
  booksTable,
  commentsTable,
  ratingsTable,
  usersTable,
} from '../db/schema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

const bookStatusSchema = z.enum(['wishlist', 'pipeline', 'reading', 'read']);
const bookIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
const commentParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  commentId: z.coerce.number().int().positive(),
});
const statusQuerySchema = z.object({
  status: bookStatusSchema.optional(),
});
const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
});
const createBookSchema = z.object({
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().min(1).max(200),
  status: bookStatusSchema,
  coverUrl: z.union([z.string().trim().url(), z.literal(''), z.null()]).optional(),
  description: z.union([z.string().trim().max(5000), z.literal(''), z.null()]).optional(),
  openLibraryId: z.union([z.string().trim().max(200), z.literal(''), z.null()]).optional(),
  dateRead: z.union([z.string().trim().max(50), z.literal(''), z.null()]).optional(),
});
const ratingBodySchema = z.object({
  score: z.number().int().min(1).max(5),
});
const commentBodySchema = z.object({
  text: z.string().trim().min(1).max(5000),
  isPrivate: z.boolean().optional().default(false),
});

const mapBookDetail = (bookId: number, viewerId: number) => {
  const book = db
    .select({
      id: booksTable.id,
      title: booksTable.title,
      author: booksTable.author,
      coverUrl: booksTable.coverUrl,
      description: booksTable.description,
      openLibraryId: booksTable.openLibraryId,
      status: booksTable.status,
      dateRead: booksTable.dateRead,
      suggestedByUserId: booksTable.suggestedByUserId,
      createdAt: booksTable.createdAt,
      updatedAt: booksTable.updatedAt,
      averageRating: avg(ratingsTable.score),
    })
    .from(booksTable)
    .leftJoin(ratingsTable, eq(ratingsTable.bookId, booksTable.id))
    .where(eq(booksTable.id, bookId))
    .groupBy(booksTable.id)
    .get();

  if (!book) {
    return null;
  }

  const ratings = db
    .select({
      id: ratingsTable.id,
      bookId: ratingsTable.bookId,
      userId: ratingsTable.userId,
      score: ratingsTable.score,
      createdAt: ratingsTable.createdAt,
      updatedAt: ratingsTable.updatedAt,
      userName: usersTable.name,
    })
    .from(ratingsTable)
    .innerJoin(usersTable, eq(usersTable.id, ratingsTable.userId))
    .where(eq(ratingsTable.bookId, bookId))
    .orderBy(desc(ratingsTable.updatedAt))
    .all();

  const comments = db
    .select({
      id: commentsTable.id,
      bookId: commentsTable.bookId,
      userId: commentsTable.userId,
      text: commentsTable.text,
      isPrivate: commentsTable.isPrivate,
      createdAt: commentsTable.createdAt,
      updatedAt: commentsTable.updatedAt,
      userName: usersTable.name,
    })
    .from(commentsTable)
    .innerJoin(usersTable, eq(usersTable.id, commentsTable.userId))
    .where(
      and(
        eq(commentsTable.bookId, bookId),
        sql`(${commentsTable.isPrivate} = 0 OR ${commentsTable.userId} = ${viewerId})`,
      ),
    )
    .orderBy(asc(commentsTable.createdAt))
    .all();

  return {
    ...book,
    averageRating: book.averageRating ? Number(book.averageRating) : null,
    ratings,
    comments,
  };
};

router.get('/', requireAuth, (req, res) => {
  const parsedQuery = statusQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid book status.' },
    });
    return;
  }

  const status = parsedQuery.data.status ?? null;

  const query = db
    .select({
      id: booksTable.id,
      title: booksTable.title,
      author: booksTable.author,
      coverUrl: booksTable.coverUrl,
      description: booksTable.description,
      openLibraryId: booksTable.openLibraryId,
      status: booksTable.status,
      dateRead: booksTable.dateRead,
      createdAt: booksTable.createdAt,
      updatedAt: booksTable.updatedAt,
      averageRating: avg(ratingsTable.score),
    })
    .from(booksTable)
    .leftJoin(ratingsTable, eq(ratingsTable.bookId, booksTable.id))
    .groupBy(booksTable.id)
    .orderBy(desc(booksTable.dateRead), desc(booksTable.createdAt));

  const books = status
    ? query.where(eq(booksTable.status, status)).all()
    : query.all();

  res.json({
    data: books.map((book) => ({
      ...book,
      averageRating: book.averageRating ? Number(book.averageRating) : null,
    })),
    error: null,
  });
});

router.get('/search', requireAuth, async (req, res) => {
  const parsedQuery = searchQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Query is required.' },
    });
    return;
  }

  const q = parsedQuery.data.q;

  const cached = searchCache.get(q.toLowerCase());
  if (cached && cached.expiresAt > Date.now()) {
    res.json({ data: cached.results, error: null });
    return;
  }

  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`,
    );
    const payload = (await response.json()) as {
      docs?: Array<{
        key?: string;
        title?: string;
        author_name?: string[];
        cover_i?: number;
        first_sentence?: string | { value?: string }[] | { value?: string };
      }>;
    };

    const results = (payload.docs ?? []).slice(0, 10).map((entry) => ({
      openLibraryId: entry.key ?? null,
      title: entry.title ?? 'Unknown title',
      author: entry.author_name?.[0] ?? 'Unknown author',
      coverUrl: entry.cover_i
        ? `https://covers.openlibrary.org/b/id/${entry.cover_i}-L.jpg`
        : null,
      description:
        typeof entry.first_sentence === 'string'
          ? entry.first_sentence
          : Array.isArray(entry.first_sentence)
            ? (entry.first_sentence[0]?.value ?? null)
            : (entry.first_sentence?.value ?? null),
    }));

    searchCache.set(q.toLowerCase(), {
      expiresAt: Date.now() + 5 * 60 * 1000,
      results,
    });
    res.json({ data: results, error: null });
  } catch (error) {
    console.warn('Open Library lookup failed', error);
    res.status(502).json({
      data: null,
      error: {
        code: 'OPEN_LIBRARY_ERROR',
        message: 'Book metadata lookup failed. Please enter details manually.',
      },
    });
  }
});

router.get('/:id', requireAuth, (req, res) => {
  const parsedParams = bookIdParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid book id.' },
    });
    return;
  }

  const book = mapBookDetail(parsedParams.data.id, req.user!.id);
  if (!book) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Book not found.' },
    });
    return;
  }

  res.json({ data: book, error: null });
});

router.post('/', requireAdmin, (req, res) => {
  const parsedBody = createBookSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Title, author, and status are required.',
      },
    });
    return;
  }

  const created = db
    .insert(booksTable)
    .values({
      title: parsedBody.data.title,
      author: parsedBody.data.author,
      coverUrl: parsedBody.data.coverUrl?.trim() || null,
      description: parsedBody.data.description?.trim() || null,
      openLibraryId: parsedBody.data.openLibraryId?.trim() || null,
      status: parsedBody.data.status,
      dateRead: parsedBody.data.dateRead?.trim() || null,
      suggestedByUserId: req.user!.id,
    })
    .returning()
    .get();

  res.status(201).json({ data: created, error: null });
});

router.patch('/:id', requireAdmin, (req, res) => {
  const parsedParams = bookIdParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid book id.' },
    });
    return;
  }

  const id = parsedParams.data.id;
  const updates: Record<string, unknown> = {};
  if (typeof req.body.title === 'string' && req.body.title.trim())
    updates.title = req.body.title.trim();
  if (typeof req.body.author === 'string' && req.body.author.trim())
    updates.author = req.body.author.trim();
  if (typeof req.body.coverUrl === 'string')
    updates.coverUrl = req.body.coverUrl.trim() || null;
  if (typeof req.body.description === 'string')
    updates.description = req.body.description.trim() || null;
  if (typeof req.body.openLibraryId === 'string')
    updates.openLibraryId = req.body.openLibraryId.trim() || null;
  if (typeof req.body.dateRead === 'string')
    updates.dateRead = req.body.dateRead || null;
  if (req.body.status !== undefined) {
    const parsedStatus = bookStatusSchema.safeParse(req.body.status);
    if (!parsedStatus.success) {
      res.status(422).json({
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid book status.' },
      });
      return;
    }
    updates.status = parsedStatus.data;
  }

  if (!Object.keys(updates).length) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'No valid fields to update.',
      },
    });
    return;
  }

  const existing = db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, id))
    .get();
  if (!existing) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Book not found.' },
    });
    return;
  }

  db.update(booksTable).set(updates).where(eq(booksTable.id, id)).run();
  const updated = db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, id))
    .get();
  res.json({ data: updated, error: null });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid book id.' },
    });
    return;
  }

  const existing = db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, id))
    .get();
  if (!existing) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Book not found.' },
    });
    return;
  }

  db.delete(commentsTable).where(eq(commentsTable.bookId, id)).run();
  db.delete(ratingsTable).where(eq(ratingsTable.bookId, id)).run();
  db.delete(booksTable).where(eq(booksTable.id, id)).run();

  res.json({ data: { success: true }, error: null });
});

router.put('/:id/rating', requireAuth, (req, res) => {
  const parsedParams = bookIdParamsSchema.safeParse(req.params);
  const parsedBody = ratingBodySchema.safeParse({ score: Number(req.body.score) });

  if (!parsedParams.success || !parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Book id and score (1-5) are required.',
      },
    });
    return;
  }

  const id = parsedParams.data.id;
  const score = parsedBody.data.score;

  const book = db.select().from(booksTable).where(eq(booksTable.id, id)).get();
  if (!book) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Book not found.' },
    });
    return;
  }

  const existing = db
    .select()
    .from(ratingsTable)
    .where(
      and(eq(ratingsTable.bookId, id), eq(ratingsTable.userId, req.user!.id)),
    )
    .get();

  if (existing) {
    db.update(ratingsTable)
      .set({ score, updatedAt: new Date().toISOString() })
      .where(eq(ratingsTable.id, existing.id))
      .run();
  } else {
    db.insert(ratingsTable)
      .values({ bookId: id, userId: req.user!.id, score })
      .run();
  }

  const rating = db
    .select()
    .from(ratingsTable)
    .where(
      and(eq(ratingsTable.bookId, id), eq(ratingsTable.userId, req.user!.id)),
    )
    .get();

  res.json({ data: rating, error: null });
});

router.get('/:id/ratings', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid book id.' },
    });
    return;
  }

  const ratings = db
    .select({
      id: ratingsTable.id,
      bookId: ratingsTable.bookId,
      userId: ratingsTable.userId,
      score: ratingsTable.score,
      createdAt: ratingsTable.createdAt,
      updatedAt: ratingsTable.updatedAt,
      userName: usersTable.name,
    })
    .from(ratingsTable)
    .innerJoin(usersTable, eq(usersTable.id, ratingsTable.userId))
    .where(eq(ratingsTable.bookId, id))
    .orderBy(desc(ratingsTable.updatedAt))
    .all();

  res.json({ data: ratings, error: null });
});

router.post('/:id/comments', requireAuth, (req, res) => {
  const parsedParams = bookIdParamsSchema.safeParse(req.params);
  const parsedBody = commentBodySchema.safeParse(req.body);

  if (!parsedParams.success || !parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Book id and comment text are required.',
      },
    });
    return;
  }

  const id = parsedParams.data.id;
  const { text, isPrivate } = parsedBody.data;

  const book = db.select().from(booksTable).where(eq(booksTable.id, id)).get();
  if (!book) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Book not found.' },
    });
    return;
  }

  const created = db
    .insert(commentsTable)
    .values({
      bookId: id,
      userId: req.user!.id,
      text,
      isPrivate,
    })
    .returning()
    .get();

  res.status(201).json({ data: created, error: null });
});

router.get('/:id/comments', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid book id.' },
    });
    return;
  }

  const comments = db
    .select({
      id: commentsTable.id,
      bookId: commentsTable.bookId,
      userId: commentsTable.userId,
      text: commentsTable.text,
      isPrivate: commentsTable.isPrivate,
      createdAt: commentsTable.createdAt,
      updatedAt: commentsTable.updatedAt,
      userName: usersTable.name,
    })
    .from(commentsTable)
    .innerJoin(usersTable, eq(usersTable.id, commentsTable.userId))
    .where(
      and(
        eq(commentsTable.bookId, id),
        sql`(${commentsTable.isPrivate} = 0 OR ${commentsTable.userId} = ${req.user!.id})`,
      ),
    )
    .orderBy(asc(commentsTable.createdAt))
    .all();

  res.json({ data: comments, error: null });
});

router.patch('/:id/comments/:commentId', requireAuth, (req, res) => {
  const commentId = Number(req.params.commentId);
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

  if (!Number.isInteger(commentId) || !text) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Comment id and text are required.',
      },
    });
    return;
  }

  const existing = db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, commentId))
    .get();
  if (!existing) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Comment not found.' },
    });
    return;
  }

  if (existing.userId !== req.user!.id) {
    res.status(403).json({
      data: null,
      error: {
        code: 'FORBIDDEN',
        message: 'You can only edit your own comments.',
      },
    });
    return;
  }

  db.update(commentsTable)
    .set({ text, updatedAt: new Date().toISOString() })
    .where(eq(commentsTable.id, commentId))
    .run();

  const updated = db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, commentId))
    .get();
  res.json({ data: updated, error: null });
});

router.delete('/:id/comments/:commentId', requireAuth, (req, res) => {
  const commentId = Number(req.params.commentId);
  if (!Number.isInteger(commentId)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid comment id.' },
    });
    return;
  }

  const existing = db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, commentId))
    .get();
  if (!existing) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Comment not found.' },
    });
    return;
  }

  if (existing.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({
      data: null,
      error: {
        code: 'FORBIDDEN',
        message: 'You cannot delete this comment.',
      },
    });
    return;
  }

  db.delete(commentsTable).where(eq(commentsTable.id, commentId)).run();
  res.json({ data: { success: true }, error: null });
});

const searchCache = new Map<
  string,
  {
    expiresAt: number;
    results: Array<{
      openLibraryId: string | null;
      title: string;
      author: string;
      coverUrl: string | null;
      description: string | null;
    }>;
  }
>();

export const booksRouter = router;
