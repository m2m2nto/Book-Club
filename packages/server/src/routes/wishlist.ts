import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db/client.js';
import { booksTable } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const createWishlistBookSchema = z.object({
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().min(1).max(200),
  description: z.union([z.string().trim().max(5000), z.literal(''), z.null()]).optional(),
  coverUrl: z.union([z.string().trim().url(), z.literal(''), z.null()]).optional(),
  openLibraryId: z.union([z.string().trim().max(200), z.literal(''), z.null()]).optional(),
});

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
  const parsedBody = createWishlistBookSchema.safeParse(req.body);

  if (!parsedBody.success) {
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
      title: parsedBody.data.title,
      author: parsedBody.data.author,
      description: parsedBody.data.description?.trim() || null,
      coverUrl: parsedBody.data.coverUrl?.trim() || null,
      openLibraryId: parsedBody.data.openLibraryId?.trim() || null,
      status: 'wishlist',
      suggestedByUserId: req.user!.id,
    })
    .returning()
    .get();

  res.status(201).json({ data: created, error: null });
});

export const wishlistRouter = router;
