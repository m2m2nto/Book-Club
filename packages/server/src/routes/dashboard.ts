import { and, asc, count, desc, eq, gt } from 'drizzle-orm';
import { Router } from 'express';

import { db } from '../db/client.js';
import {
  bookSurveysTable,
  meetingsTable,
  rsvpsTable,
  usersTable,
} from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const currentBook = db
    .select({
      id: meetingsTable.id,
      date: meetingsTable.date,
      time: meetingsTable.time,
      location: meetingsTable.location,
      bookId: meetingsTable.bookId,
    })
    .from(meetingsTable)
    .where(
      and(eq(meetingsTable.status, 'scheduled'), gt(meetingsTable.date, today)),
    )
    .orderBy(asc(meetingsTable.date), asc(meetingsTable.time))
    .get();

  const nextMeeting = db
    .select()
    .from(meetingsTable)
    .where(
      and(eq(meetingsTable.status, 'scheduled'), gt(meetingsTable.date, today)),
    )
    .orderBy(asc(meetingsTable.date), asc(meetingsTable.time))
    .get();

  const myRsvp = nextMeeting
    ? db
        .select()
        .from(rsvpsTable)
        .where(
          and(
            eq(rsvpsTable.meetingId, nextMeeting.id),
            eq(rsvpsTable.userId, req.user!.id),
          ),
        )
        .get()
    : null;

  const openSurveys = db
    .select()
    .from(bookSurveysTable)
    .where(eq(bookSurveysTable.status, 'open'))
    .orderBy(desc(bookSurveysTable.createdAt))
    .all();

  const pendingRsvps = db
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
    })
    .from(meetingsTable)
    .where(
      and(eq(meetingsTable.status, 'scheduled'), gt(meetingsTable.date, today)),
    )
    .orderBy(asc(meetingsTable.date))
    .all()
    .filter(
      (meeting) =>
        !db
          .select()
          .from(rsvpsTable)
          .where(
            and(
              eq(rsvpsTable.meetingId, meeting.id),
              eq(rsvpsTable.userId, req.user!.id),
            ),
          )
          .get(),
    );

  const adminSummary =
    req.user!.role === 'admin'
      ? {
          users:
            db
              .select({ value: count(usersTable.id) })
              .from(usersTable)
              .get()?.value ?? 0,
          meetings:
            db
              .select({ value: count(meetingsTable.id) })
              .from(meetingsTable)
              .get()?.value ?? 0,
          openSurveys: openSurveys.length,
        }
      : null;

  res.json({
    data: {
      currentBook,
      nextMeeting,
      myRsvp,
      openSurveys,
      pendingRsvps,
      adminSummary,
    },
    error: null,
  });
});

export const dashboardRouter = router;
