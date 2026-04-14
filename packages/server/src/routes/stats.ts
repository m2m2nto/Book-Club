import { avg, count, desc, eq, sql } from 'drizzle-orm';
import { Router } from 'express';

import { db } from '../db/client.js';
import { booksTable, commentsTable, ratingsTable } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/club', requireAuth, (_req, res) => {
  const booksPerYear = db
    .select({
      year: sql<string>`substr(${booksTable.dateRead}, 1, 4)`,
      count: count(booksTable.id),
    })
    .from(booksTable)
    .where(sql`${booksTable.dateRead} is not null`)
    .groupBy(sql`substr(${booksTable.dateRead}, 1, 4)`)
    .orderBy(sql`substr(${booksTable.dateRead}, 1, 4)`)
    .all();

  const averageRatings = db
    .select({
      bookId: booksTable.id,
      title: booksTable.title,
      author: booksTable.author,
      averageRating: avg(ratingsTable.score),
      ratingsCount: count(ratingsTable.id),
    })
    .from(booksTable)
    .leftJoin(ratingsTable, eq(ratingsTable.bookId, booksTable.id))
    .groupBy(booksTable.id)
    .orderBy(desc(avg(ratingsTable.score)))
    .all()
    .map((row) => ({
      ...row,
      averageRating: row.averageRating ? Number(row.averageRating) : null,
    }));

  res.json({ data: { booksPerYear, averageRatings }, error: null });
});

router.get('/me', requireAuth, (req, res) => {
  const ratingDistribution = db
    .select({ score: ratingsTable.score, count: count(ratingsTable.id) })
    .from(ratingsTable)
    .where(eq(ratingsTable.userId, req.user!.id))
    .groupBy(ratingsTable.score)
    .orderBy(ratingsTable.score)
    .all();

  const summary = db
    .select({
      booksRated: count(ratingsTable.id),
      averageRating: avg(ratingsTable.score),
    })
    .from(ratingsTable)
    .where(eq(ratingsTable.userId, req.user!.id))
    .get();

  const commentCount =
    db
      .select({ value: count(commentsTable.id) })
      .from(commentsTable)
      .where(eq(commentsTable.userId, req.user!.id))
      .get()?.value ?? 0;

  res.json({
    data: {
      ratingDistribution,
      booksRated: summary?.booksRated ?? 0,
      averageRating: summary?.averageRating
        ? Number(summary.averageRating)
        : null,
      commentCount,
    },
    error: null,
  });
});

export const statsRouter = router;
