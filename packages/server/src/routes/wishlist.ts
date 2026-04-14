import { eq } from 'drizzle-orm';
import { Router } from 'express';

import { db } from '../db/client.js';
import { booksTable } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', (_req, res) => {
  const books = db
    .select()
    .from(booksTable)
    .where(eq(booksTable.status, 'wishlist'))
    .all();

  res.json({ data: books, error: null });
});

router.post('/', (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const author =
    typeof req.body.author === 'string' ? req.body.author.trim() : '';

  if (!title || !author) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Title and author are required.',
      },
    });
    return;
  }

  const created = db
    .insert(booksTable)
    .values({
      title,
      author,
      description:
        typeof req.body.description === 'string'
          ? req.body.description.trim() || null
          : null,
      coverUrl:
        typeof req.body.coverUrl === 'string'
          ? req.body.coverUrl.trim() || null
          : null,
      openLibraryId:
        typeof req.body.openLibraryId === 'string'
          ? req.body.openLibraryId.trim() || null
          : null,
      status: 'wishlist',
      suggestedByUserId: req.user!.id,
    })
    .returning()
    .get();

  res.status(201).json({ data: created, error: null });
});

export const wishlistRouter = router;
