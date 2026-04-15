import { and, asc, count, eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db/client.js';
import {
  booksTable,
  meetingsTable,
  rsvpsTable,
  usersTable,
} from '../db/schema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

const meetingIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
const createMeetingSchema = z.object({
  date: z.string().trim().min(1).max(50),
  time: z.string().trim().min(1).max(50),
  location: z.string().trim().min(1).max(500),
  bookId: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
});
const rsvpBodySchema = z.object({
  status: z.enum(['yes', 'no', 'maybe']),
});

const mapMeeting = (meetingId: number) => {
  const meeting = db
    .select({
      id: meetingsTable.id,
      date: meetingsTable.date,
      time: meetingsTable.time,
      location: meetingsTable.location,
      bookId: meetingsTable.bookId,
      status: meetingsTable.status,
      recap: meetingsTable.recap,
      createdAt: meetingsTable.createdAt,
      updatedAt: meetingsTable.updatedAt,
      bookTitle: booksTable.title,
      bookAuthor: booksTable.author,
      bookCoverUrl: booksTable.coverUrl,
    })
    .from(meetingsTable)
    .leftJoin(booksTable, eq(booksTable.id, meetingsTable.bookId))
    .where(eq(meetingsTable.id, meetingId))
    .get();

  if (!meeting) return null;

  const rsvps = db
    .select({
      id: rsvpsTable.id,
      meetingId: rsvpsTable.meetingId,
      userId: rsvpsTable.userId,
      status: rsvpsTable.status,
      respondedAt: rsvpsTable.respondedAt,
      updatedAt: rsvpsTable.updatedAt,
      userName: usersTable.name,
    })
    .from(rsvpsTable)
    .innerJoin(usersTable, eq(usersTable.id, rsvpsTable.userId))
    .where(eq(rsvpsTable.meetingId, meetingId))
    .orderBy(asc(usersTable.name))
    .all();

  return {
    ...meeting,
    rsvps,
    rsvpCounts: {
      yes: rsvps.filter((row) => row.status === 'yes').length,
      no: rsvps.filter((row) => row.status === 'no').length,
      maybe: rsvps.filter((row) => row.status === 'maybe').length,
    },
  };
};

router.get('/', requireAuth, (_req, res) => {
  const meetings = db
    .select({
      id: meetingsTable.id,
      date: meetingsTable.date,
      time: meetingsTable.time,
      location: meetingsTable.location,
      bookId: meetingsTable.bookId,
      status: meetingsTable.status,
      recap: meetingsTable.recap,
      createdAt: meetingsTable.createdAt,
      updatedAt: meetingsTable.updatedAt,
      bookTitle: booksTable.title,
      bookAuthor: booksTable.author,
      bookCoverUrl: booksTable.coverUrl,
      rsvpCount: count(rsvpsTable.id),
    })
    .from(meetingsTable)
    .leftJoin(booksTable, eq(booksTable.id, meetingsTable.bookId))
    .leftJoin(rsvpsTable, eq(rsvpsTable.meetingId, meetingsTable.id))
    .groupBy(meetingsTable.id)
    .orderBy(asc(meetingsTable.date), asc(meetingsTable.time))
    .all();

  res.json({ data: meetings, error: null });
});

router.get('/:id', requireAuth, (req, res) => {
  const parsedParams = meetingIdParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid meeting id.' },
    });
    return;
  }

  const meeting = mapMeeting(parsedParams.data.id);
  if (!meeting) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Meeting not found.' },
    });
    return;
  }

  res.json({ data: meeting, error: null });
});

router.post('/', requireAdmin, (req, res) => {
  const parsedBody = createMeetingSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Date, time, and location are required.',
      },
    });
    return;
  }

  const { date, time, location } = parsedBody.data;
  const bookId = parsedBody.data.bookId ?? null;

  if (bookId !== null) {

    const book = db
      .select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId))
      .get();
    if (!book) {
      res.status(404).json({
        data: null,
        error: { code: 'NOT_FOUND', message: 'Book not found.' },
      });
      return;
    }

    const existingMeeting = db
      .select()
      .from(meetingsTable)
      .where(eq(meetingsTable.bookId, bookId))
      .get();
    if (existingMeeting) {
      res.status(422).json({
        data: null,
        error: {
          code: 'BOOK_ALREADY_SCHEDULED',
          message: 'This book is already associated with a meeting.',
        },
      });
      return;
    }
  }

  const created = db
    .insert(meetingsTable)
    .values({ date, time, location, bookId, status: 'scheduled' })
    .returning()
    .get();

  if (bookId !== null) {
    db.update(booksTable)
      .set({ status: 'reading' })
      .where(eq(booksTable.id, bookId))
      .run();
  }

  res.status(201).json({ data: mapMeeting(created.id), error: null });
});

router.patch('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid meeting id.' },
    });
    return;
  }

  const existing = db
    .select()
    .from(meetingsTable)
    .where(eq(meetingsTable.id, id))
    .get();
  if (!existing) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Meeting not found.' },
    });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (typeof req.body.date === 'string') updates.date = req.body.date;
  if (typeof req.body.time === 'string') updates.time = req.body.time;
  if (typeof req.body.location === 'string' && req.body.location.trim())
    updates.location = req.body.location.trim();
  if (typeof req.body.recap === 'string')
    updates.recap = req.body.recap.trim() || null;
  if (
    typeof req.body.status === 'string' &&
    ['scheduled', 'completed', 'cancelled'].includes(req.body.status)
  )
    updates.status = req.body.status;
  if (req.body.bookId !== undefined) {
    const bookId = req.body.bookId === null ? null : Number(req.body.bookId);
    if (bookId !== null && !Number.isInteger(bookId)) {
      res.status(422).json({
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid book id.' },
      });
      return;
    }
    if (bookId !== null) {
      const book = db
        .select()
        .from(booksTable)
        .where(eq(booksTable.id, bookId))
        .get();
      if (!book) {
        res.status(404).json({
          data: null,
          error: { code: 'NOT_FOUND', message: 'Book not found.' },
        });
        return;
      }
      const anotherMeeting = db
        .select()
        .from(meetingsTable)
        .where(
          and(
            eq(meetingsTable.bookId, bookId),
            sql`${meetingsTable.id} != ${id}`,
          ),
        )
        .get();
      if (anotherMeeting) {
        res.status(422).json({
          data: null,
          error: {
            code: 'BOOK_ALREADY_SCHEDULED',
            message: 'This book is already associated with another meeting.',
          },
        });
        return;
      }
      updates.bookId = bookId;
      updates.status = req.body.status ?? existing.status;
      db.update(booksTable)
        .set({ status: 'reading' })
        .where(eq(booksTable.id, bookId))
        .run();
    } else {
      updates.bookId = null;
    }
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

  db.update(meetingsTable).set(updates).where(eq(meetingsTable.id, id)).run();
  res.json({ data: mapMeeting(id), error: null });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid meeting id.' },
    });
    return;
  }

  const existing = db
    .select()
    .from(meetingsTable)
    .where(eq(meetingsTable.id, id))
    .get();
  if (!existing) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Meeting not found.' },
    });
    return;
  }

  db.update(meetingsTable)
    .set({ status: 'cancelled' })
    .where(eq(meetingsTable.id, id))
    .run();
  res.json({ data: mapMeeting(id), error: null });
});

router.put('/:id/rsvp', requireAuth, (req, res) => {
  const parsedParams = meetingIdParamsSchema.safeParse(req.params);
  const parsedBody = rsvpBodySchema.safeParse(req.body);

  if (!parsedParams.success || !parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Meeting id and valid RSVP status are required.',
      },
    });
    return;
  }

  const id = parsedParams.data.id;
  const { status } = parsedBody.data;

  const meeting = db
    .select()
    .from(meetingsTable)
    .where(eq(meetingsTable.id, id))
    .get();
  if (!meeting) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Meeting not found.' },
    });
    return;
  }

  if (meeting.status === 'cancelled') {
    res.status(422).json({
      data: null,
      error: {
        code: 'MEETING_CANCELLED',
        message: 'Cannot RSVP to a cancelled meeting.',
      },
    });
    return;
  }

  if (
    new Date(meeting.date).getTime() <
    new Date(new Date().toISOString().slice(0, 10)).getTime()
  ) {
    res.status(422).json({
      data: null,
      error: {
        code: 'RSVP_CLOSED',
        message: 'RSVPs are closed for this meeting.',
      },
    });
    return;
  }

  const existing = db
    .select()
    .from(rsvpsTable)
    .where(
      and(eq(rsvpsTable.meetingId, id), eq(rsvpsTable.userId, req.user!.id)),
    )
    .get();

  if (existing) {
    db.update(rsvpsTable)
      .set({
        status,
        updatedAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
      })
      .where(eq(rsvpsTable.id, existing.id))
      .run();
  } else {
    db.insert(rsvpsTable)
      .values({
        meetingId: id,
        userId: req.user!.id,
        status,
        respondedAt: new Date().toISOString(),
      })
      .run();
  }

  const rsvp = db
    .select()
    .from(rsvpsTable)
    .where(
      and(eq(rsvpsTable.meetingId, id), eq(rsvpsTable.userId, req.user!.id)),
    )
    .get();

  res.json({ data: rsvp, error: null });
});

router.get('/:id/rsvps', requireAuth, (req, res) => {
  const parsedParams = meetingIdParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid meeting id.' },
    });
    return;
  }

  const id = parsedParams.data.id;

  const rows = db
    .select({
      id: rsvpsTable.id,
      meetingId: rsvpsTable.meetingId,
      userId: rsvpsTable.userId,
      status: rsvpsTable.status,
      respondedAt: rsvpsTable.respondedAt,
      updatedAt: rsvpsTable.updatedAt,
      userName: usersTable.name,
    })
    .from(rsvpsTable)
    .innerJoin(usersTable, eq(usersTable.id, rsvpsTable.userId))
    .where(eq(rsvpsTable.meetingId, id))
    .orderBy(asc(usersTable.name))
    .all();

  res.json({ data: rows, error: null });
});

export const meetingsRouter = router;
