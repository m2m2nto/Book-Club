import { and, desc, eq, inArray } from 'drizzle-orm';
import { Router } from 'express';

import { db } from '../db/client.js';
import {
  bookSurveyOptionsTable,
  bookSurveyVotesTable,
  bookSurveysTable,
  booksTable,
} from '../db/schema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

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
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid survey id.' },
    });
    return;
  }

  const survey = mapSurvey(id);
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
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const closesAt =
    typeof req.body.closesAt === 'string' ? req.body.closesAt : '';
  const maxVotes = Number(req.body.maxVotes ?? 1);
  const bookIds = Array.isArray(req.body.bookIds)
    ? req.body.bookIds
        .map((value: unknown) => Number(value))
        .filter((value: number) => Number.isInteger(value))
    : [];

  if (!title || !closesAt || maxVotes < 1 || maxVotes > 3 || !bookIds.length) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Title, closesAt, maxVotes, and bookIds are required.',
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
    .values(bookIds.map((bookId: number) => ({ surveyId: survey.id, bookId })))
    .run();

  res.status(201).json({ data: mapSurvey(survey.id), error: null });
});

router.post('/:id/vote', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const votes = Array.isArray(req.body.votes)
    ? req.body.votes
        .map((vote: { optionId: unknown; rank: unknown }) => ({
          optionId: Number(vote.optionId),
          rank: Number(vote.rank),
        }))
        .filter(
          (vote: { optionId: number; rank: number }) =>
            Number.isInteger(vote.optionId) && Number.isInteger(vote.rank),
        )
    : [];

  if (!Number.isInteger(id) || !votes.length) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Survey id and ranked votes are required.',
      },
    });
    return;
  }

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
      votes.map((vote: { optionId: number; rank: number }) => ({
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
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid survey id.' },
    });
    return;
  }

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
  const id = Number(req.params.id);
  const winningBookId = Number(req.body.bookId);

  if (!Number.isInteger(id) || !Number.isInteger(winningBookId)) {
    res.status(422).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Survey id and winning book id are required.',
      },
    });
    return;
  }

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
