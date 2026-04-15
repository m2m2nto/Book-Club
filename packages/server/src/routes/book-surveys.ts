import { and, desc, eq, inArray } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import { db } from '../db/client.js';
import {
  bookSurveyOptionsTable,
  bookSurveyVotesTable,
  bookSurveysTable,
  booksTable,
} from '../db/schema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

const surveyIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
const createBookSurveySchema = z.object({
  title: z.string().trim().min(1).max(200),
  closesAt: z.string().trim().min(1).max(100),
  maxVotes: z.coerce.number().int().min(1).max(3),
  bookIds: z.array(z.coerce.number().int().positive()).min(1),
});
const surveyVoteSchema = z.object({
  votes: z
    .array(
      z.object({
        optionId: z.coerce.number().int().positive(),
        rank: z.coerce.number().int().min(1).max(3),
      }),
    )
    .min(1),
});
const resolveTieSchema = z.object({
  bookId: z.coerce.number().int().positive(),
});

const mapSurvey = (surveyId: number) => {
  const survey = db
    .select()
    .from(bookSurveysTable)
    .where(eq(bookSurveysTable.id, surveyId))
    .get();

  if (!survey) return null;

  const options = db
    .select({
      id: bookSurveyOptionsTable.id,
      surveyId: bookSurveyOptionsTable.surveyId,
      bookId: bookSurveyOptionsTable.bookId,
      title: booksTable.title,
      author: booksTable.author,
      coverUrl: booksTable.coverUrl,
      status: booksTable.status,
    })
    .from(bookSurveyOptionsTable)
    .innerJoin(booksTable, eq(booksTable.id, bookSurveyOptionsTable.bookId))
    .where(eq(bookSurveyOptionsTable.surveyId, surveyId))
    .all();

  const votes = db
    .select()
    .from(bookSurveyVotesTable)
    .where(eq(bookSurveyVotesTable.surveyId, surveyId))
    .all();

  const scoreByOption = new Map<number, number>();
  for (const vote of votes) {
    const points = vote.rank === 1 ? 3 : vote.rank === 2 ? 2 : 1;
    scoreByOption.set(
      vote.surveyOptionId,
      (scoreByOption.get(vote.surveyOptionId) ?? 0) + points,
    );
  }

  const rankedOptions = options
    .map((option) => ({ ...option, score: scoreByOption.get(option.id) ?? 0 }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return {
    ...survey,
    options: rankedOptions,
    votes,
  };
};

router.get('/', requireAuth, (_req, res) => {
  const surveys = db
    .select()
    .from(bookSurveysTable)
    .orderBy(desc(bookSurveysTable.createdAt))
    .all()
    .map((survey) => mapSurvey(survey.id));

  res.json({ data: surveys.filter(Boolean), error: null });
});

router.get('/:id', requireAuth, (req, res) => {
  const parsedParams = surveyIdParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid survey id.' },
    });
    return;
  }

  const survey = mapSurvey(parsedParams.data.id);
  if (!survey) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Survey not found.' },
    });
    return;
  }

  res.json({ data: survey, error: null });
});

router.post('/', requireAdmin, (req, res) => {
  const parsedBody = createBookSurveySchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Title, closesAt, maxVotes, and bookIds are required.',
      },
    });
    return;
  }

  const { title, closesAt, maxVotes, bookIds } = parsedBody.data;

  if (new Set(bookIds).size !== bookIds.length) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Survey book options must be unique.',
      },
    });
    return;
  }

  const availableBooks = db
    .select()
    .from(booksTable)
    .where(
      and(inArray(booksTable.id, bookIds), eq(booksTable.status, 'wishlist')),
    )
    .all();

  if (availableBooks.length !== bookIds.length) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'All survey options must be wishlist books.',
      },
    });
    return;
  }

  const survey = db
    .insert(bookSurveysTable)
    .values({
      title,
      maxVotes,
      closesAt,
      createdByUserId: req.user!.id,
      status: 'open',
    })
    .returning()
    .get();

  db.insert(bookSurveyOptionsTable)
    .values(bookIds.map((bookId) => ({ surveyId: survey.id, bookId })))
    .run();

  res.status(201).json({ data: mapSurvey(survey.id), error: null });
});

router.post('/:id/vote', requireAuth, (req, res) => {
  const parsedParams = surveyIdParamsSchema.safeParse(req.params);
  const parsedBody = surveyVoteSchema.safeParse(req.body);

  if (!parsedParams.success || !parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Survey id and ranked votes are required.',
      },
    });
    return;
  }

  const id = parsedParams.data.id;
  const votes = parsedBody.data.votes;

  const survey = db
    .select()
    .from(bookSurveysTable)
    .where(eq(bookSurveysTable.id, id))
    .get();
  if (!survey) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Survey not found.' },
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
        message: 'Voting is closed for this survey.',
      },
    });
    return;
  }

  if (votes.length > survey.maxVotes) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Too many votes submitted.',
      },
    });
    return;
  }

  const seenOptionIds = new Set<number>();
  for (const vote of votes) {
    if (seenOptionIds.has(vote.optionId)) {
      res.status(422).json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Votes must not contain duplicate options.',
        },
      });
      return;
    }
    seenOptionIds.add(vote.optionId);
  }

  const priorVote = db
    .select()
    .from(bookSurveyVotesTable)
    .where(
      and(
        eq(bookSurveyVotesTable.surveyId, id),
        eq(bookSurveyVotesTable.userId, req.user!.id),
      ),
    )
    .get();
  if (priorVote) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VOTE_LOCKED',
        message: 'Votes cannot be changed after submission.',
      },
    });
    return;
  }

  const optionIds = db
    .select({ id: bookSurveyOptionsTable.id })
    .from(bookSurveyOptionsTable)
    .where(eq(bookSurveyOptionsTable.surveyId, id))
    .all()
    .map((row) => row.id);

  const seenRanks = new Set<number>();
  for (const vote of votes) {
    if (
      !optionIds.includes(vote.optionId) ||
      vote.rank < 1 ||
      vote.rank > 3 ||
      seenRanks.has(vote.rank)
    ) {
      res.status(422).json({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Votes must reference survey options with unique ranks.',
        },
      });
      return;
    }
    seenRanks.add(vote.rank);
  }

  db.insert(bookSurveyVotesTable)
    .values(
      votes.map((vote) => ({
        surveyId: id,
        surveyOptionId: vote.optionId,
        userId: req.user!.id,
        rank: vote.rank,
      })),
    )
    .run();

  res.status(201).json({ data: mapSurvey(id), error: null });
});

router.patch('/:id/close', requireAdmin, (req, res) => {
  const parsedParams = surveyIdParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid survey id.' },
    });
    return;
  }

  const id = parsedParams.data.id;
  const survey = mapSurvey(id);
  if (!survey) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Survey not found.' },
    });
    return;
  }

  const topScore = survey.options[0]?.score ?? 0;
  const tied = survey.options.filter(
    (option) => option.score === topScore && topScore > 0,
  );

  if (tied.length > 1) {
    db.update(bookSurveysTable)
      .set({ status: 'tie-break-required' })
      .where(eq(bookSurveysTable.id, id))
      .run();

    res.json({ data: mapSurvey(id), error: null });
    return;
  }

  db.update(bookSurveysTable)
    .set({
      status: 'closed',
      resolvedBookId: survey.options[0]?.bookId ?? null,
      resolvedByUserId: req.user!.id,
    })
    .where(eq(bookSurveysTable.id, id))
    .run();

  if (survey.options[0]) {
    db.update(booksTable)
      .set({ status: 'pipeline' })
      .where(eq(booksTable.id, survey.options[0].bookId))
      .run();
  }

  res.json({ data: mapSurvey(id), error: null });
});

router.patch('/:id/resolve-tie', requireAdmin, (req, res) => {
  const parsedParams = surveyIdParamsSchema.safeParse(req.params);
  const parsedBody = resolveTieSchema.safeParse(req.body);

  if (!parsedParams.success || !parsedBody.success) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Survey id and winning book id are required.',
      },
    });
    return;
  }

  const id = parsedParams.data.id;
  const winningBookId = parsedBody.data.bookId;

  const survey = mapSurvey(id);
  if (!survey) {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Survey not found.' },
    });
    return;
  }

  const topScore = survey.options[0]?.score ?? 0;
  const tied = survey.options.filter(
    (option) => option.score === topScore && topScore > 0,
  );
  if (!tied.some((option) => option.bookId === winningBookId)) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Winning book must be one of the tied options.',
      },
    });
    return;
  }

  db.update(bookSurveysTable)
    .set({
      status: 'closed',
      resolvedBookId: winningBookId,
      resolvedByUserId: req.user!.id,
    })
    .where(eq(bookSurveysTable.id, id))
    .run();

  db.update(booksTable)
    .set({ status: 'pipeline' })
    .where(eq(booksTable.id, winningBookId))
    .run();

  res.json({ data: mapSurvey(id), error: null });
});

export const bookSurveysRouter = router;
