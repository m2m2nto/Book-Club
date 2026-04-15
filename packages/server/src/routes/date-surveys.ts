import { and, asc, count, desc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db/client.js';
import {
  booksTable,
  dateSurveyOptionsTable,
  dateSurveyVotesTable,
  dateSurveysTable,
  meetingsTable,
} from '../db/schema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

const surveyIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
const createDateSurveySchema = z.object({
  title: z.string().trim().min(1).max(200),
  closesAt: z.string().trim().min(1).max(100),
  dates: z.array(z.string().trim().min(1).max(50)).min(2),
  time: z.string().trim().min(1).max(50),
  location: z.string().trim().min(1).max(500),
  bookId: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
});
const voteDateSurveySchema = z.object({
  optionIds: z.array(z.coerce.number().int().positive()).min(1),
});
const closeDateSurveySchema = z.object({
  optionId: z.coerce.number().int().positive(),
});

const mapDateSurvey = (surveyId: number) => {
  const survey = db
    .select()
    .from(dateSurveysTable)
    .where(eq(dateSurveysTable.id, surveyId))
    .get();
  if (!survey) return null;

  const options = db
    .select({
      id: dateSurveyOptionsTable.id,
      dateSurveyId: dateSurveyOptionsTable.dateSurveyId,
      proposedDate: dateSurveyOptionsTable.proposedDate,
      votes: count(dateSurveyVotesTable.id),
    })
    .from(dateSurveyOptionsTable)
    .leftJoin(
      dateSurveyVotesTable,
      eq(dateSurveyVotesTable.dateSurveyOptionId, dateSurveyOptionsTable.id),
    )
    .where(eq(dateSurveyOptionsTable.dateSurveyId, surveyId))
    .groupBy(dateSurveyOptionsTable.id)
    .orderBy(asc(dateSurveyOptionsTable.proposedDate))
    .all();

  const votes = db
    .select()
    .from(dateSurveyVotesTable)
    .where(eq(dateSurveyVotesTable.dateSurveyId, surveyId))
    .all();

  return { ...survey, options, votes };
};

router.get('/', requireAuth, (_req, res) => {
  const surveys = db
    .select()
    .from(dateSurveysTable)
    .orderBy(desc(dateSurveysTable.createdAt))
    .all()
    .map((survey) => mapDateSurvey(survey.id));
  res.json({ data: surveys.filter(Boolean), error: null });
});

router.get('/:id', requireAuth, (req, res) => {
  const parsedParams = surveyIdParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid date survey id.' },
    });
    return;
  }

  const survey = mapDateSurvey(parsedParams.data.id);
  if (!survey) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Date survey not found.' },
    });
    return;
  }
  res.json({ data: survey, error: null });
});

router.post('/', requireAdmin, (req, res) => {
  const parsedBody = createDateSurveySchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message:
          'Title, closesAt, time, location, and at least two dates are required.',
      },
    });
    return;
  }

  const { title, closesAt, time, location } = parsedBody.data;
  const dates = parsedBody.data.dates.map((date) => date.trim());
  const bookId = parsedBody.data.bookId ?? null;

  if (new Set(dates).size !== dates.length) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Date survey options must be unique.',
      },
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
  }

  const survey = db
    .insert(dateSurveysTable)
    .values({
      title,
      closesAt,
      createdByUserId: req.user!.id,
      status: 'open',
      time,
      location,
      bookId,
    })
    .returning()
    .get();

  db.insert(dateSurveyOptionsTable)
    .values(
      dates.map((proposedDate) => ({
        dateSurveyId: survey.id,
        proposedDate,
      })),
    )
    .run();

  res.status(201).json({ data: mapDateSurvey(survey.id), error: null });
});

router.post('/:id/vote', requireAuth, (req, res) => {
  const parsedParams = surveyIdParamsSchema.safeParse(req.params);
  const parsedBody = voteDateSurveySchema.safeParse(req.body);

  if (!parsedParams.success || !parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Date survey id and selected options are required.',
      },
    });
    return;
  }

  const id = parsedParams.data.id;
  const optionIds = parsedBody.data.optionIds;

  if (new Set(optionIds).size !== optionIds.length) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Selected options must be unique.',
      },
    });
    return;
  }

  const survey = db
    .select()
    .from(dateSurveysTable)
    .where(eq(dateSurveysTable.id, id))
    .get();
  if (!survey) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Date survey not found.' },
    });
    return;
  }

  if (
    survey.status !== 'open' ||
    new Date(survey.closesAt).getTime() < Date.now()
  ) {
    res.status(422).json({
      data: null,
      error: {
        code: 'SURVEY_CLOSED',
        message: 'Voting is closed for this date survey.',
      },
    });
    return;
  }

  const validOptionIds = db
    .select({ id: dateSurveyOptionsTable.id })
    .from(dateSurveyOptionsTable)
    .where(eq(dateSurveyOptionsTable.dateSurveyId, id))
    .all()
    .map((row) => row.id);

  if (optionIds.some((optionId) => !validOptionIds.includes(optionId))) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Votes must reference valid date options.',
      },
    });
    return;
  }

  db.delete(dateSurveyVotesTable)
    .where(
      and(
        eq(dateSurveyVotesTable.dateSurveyId, id),
        eq(dateSurveyVotesTable.userId, req.user!.id),
      ),
    )
    .run();

  db.insert(dateSurveyVotesTable)
    .values(
      optionIds.map((optionId) => ({
        dateSurveyId: id,
        dateSurveyOptionId: optionId,
        userId: req.user!.id,
      })),
    )
    .run();

  res.status(201).json({ data: mapDateSurvey(id), error: null });
});

router.patch('/:id/close', requireAdmin, (req, res) => {
  const parsedParams = surveyIdParamsSchema.safeParse(req.params);
  const parsedBody = closeDateSurveySchema.safeParse(req.body);

  if (!parsedParams.success || !parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Date survey id and selected option are required.',
      },
    });
    return;
  }

  const id = parsedParams.data.id;
  const selectedOptionId = parsedBody.data.optionId;

  const survey = mapDateSurvey(id);
  if (!survey) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Date survey not found.' },
    });
    return;
  }

  const selectedOption = survey.options.find(
    (option) => option.id === selectedOptionId,
  );
  if (!selectedOption) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Selected option must belong to the survey.',
      },
    });
    return;
  }

  const meeting = db
    .insert(meetingsTable)
    .values({
      date: selectedOption.proposedDate,
      time: survey.time,
      location: survey.location,
      bookId: survey.bookId,
      status: 'scheduled',
    })
    .returning()
    .get();

  if (survey.bookId !== null) {
    db.update(booksTable)
      .set({ status: 'reading' })
      .where(eq(booksTable.id, survey.bookId))
      .run();
  }

  db.update(dateSurveysTable)
    .set({
      status: 'closed',
      meetingId: meeting.id,
      confirmedOptionId: selectedOptionId,
    })
    .where(eq(dateSurveysTable.id, id))
    .run();

  res.json({ data: mapDateSurvey(id), error: null });
});

export const dateSurveysRouter = router;
