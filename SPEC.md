# Spec: Book Club Manager

## Objective

Build a self-hosted web application for managing a small book club of up to 30 members.

The app should let members:
- sign in with Google SSO
- view books the club has read or plans to read
- suggest books for future reading
- participate in book surveys and date surveys
- RSVP to meetings
- view summaries, dashboards, and personal reading stats

The app should let admins:
- bootstrap and manage users
- manage books, meetings, and surveys
- send reminder workflows
- export the database for backup

Success for v1 means a small club can run its full operating workflow in one place: user setup, book selection, meeting scheduling, reminders, RSVPs, and historical tracking.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React (Vite), React Router, TanStack Query |
| UI | Tailwind CSS + shadcn/ui components |
| Backend | Node.js, Express |
| Database | SQLite (via better-sqlite3) |
| ORM | Drizzle ORM |
| Auth | Passport.js (Google OAuth 2.0 only in v1) |
| Email | Nodemailer (SMTP configuration) |
| Scheduler | node-cron |
| Monorepo | npm workspaces |
| Runtime | Node.js 20+ |
| Timezone | Europe/Luxembourg |

## Commands

These are the intended repository commands to support during implementation:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run format:check
npm test
npm run db:migrate
npm run db:seed
npm run e2e
```

Package-level commands may include:

```bash
npm run dev --workspace @book-club/server
npm run dev --workspace @book-club/client
npm run test --workspace @book-club/server
npm run test --workspace @book-club/client
```

## Project Structure

```text
book-club/
  package.json              # workspace root
  SPEC.md                   # living specification
  tasks/
    plan.md                 # implementation plan
    todo.md                 # task checklist
  packages/
    client/                 # React frontend
      src/
        components/         # Reusable UI components
        pages/              # Route pages
        hooks/              # Custom React hooks
        lib/                # API client, utilities
        App.tsx
        main.tsx
      index.html
      vite.config.ts
      package.json
    server/                 # Express backend
      src/
        routes/             # Route handlers
        middleware/         # Auth and role guards
        db/
          schema.ts         # Drizzle schema source of truth
          migrations/       # SQL migrations
        services/           # Email, scheduling, business logic
        index.ts            # Server entry point
      package.json
    shared/                 # Shared types and constants
      src/
        types.ts
        constants.ts
      package.json
```

## Features & Acceptance Criteria

### Authentication & User Management

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| A1 | Google SSO login | Users can sign in via Google OAuth 2.0. No self-registration. |
| A2 | Apple Sign In | Deferred post-v1. Not implemented in v1. |
| A3 | Initial admin bootstrap | One initial admin can be created via seed/bootstrap flow and can create additional admins or standard users. |
| A4 | Admin creates users | Admin adds a user by email. Only pre-registered emails can log in via SSO. |
| A5 | Admin manages users | Admin can list, deactivate, reactivate, and soft-delete users. |
| A6 | Immediate access revocation | Deactivated or soft-deleted users are blocked from existing sessions immediately and cannot log in. |
| A7 | Historical retention | Ratings, comments, votes, RSVPs, and related historical data remain after user soft-delete. |
| A8 | Role enforcement | Admin-only actions are blocked for regular users in both API and UI. |

### Book Management

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| B1 | Book history | List of all books the club has read, ordered by `dateRead`, with cover, title, and author. |
| B2 | Book details | Each book page shows title, author, cover, description, Open Library ID when present, date read, ratings, notes, and comments. |
| B3 | Admin adds/edits/deletes books | Admin can manage title, author, cover image URL, description, Open Library ID, date read, and status. |
| B4 | Book statuses | Supported statuses are `wishlist`, `pipeline`, `reading`, and `read`. |
| B5 | Status rules | Multiple books may be `reading` at once. Multiple books may be `pipeline` at once. |
| B6 | Per-user ratings | Each user can rate a book from 1 to 5 once and later update the rating. |
| B7 | Private notes | Each user can leave private notes visible only to that same user. Admins cannot see private notes. |
| B8 | Public comments | Each user can leave public comments visible to all members. Comments are ordered oldest first. |
| B9 | Comment moderation | Users can edit their own comments. Admins can delete any comment. |

### Wishlist & Book Surveys

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| W1 | Wishlist suggestion | Any user can add a book to the wishlist with title, author, and optional description or external link. |
| W2 | Admin creates book survey | Admin selects wishlist books and creates a poll with configurable `maxVotes` from 1 to 3. |
| W3 | Ranked multi-vote | Members may vote for up to `maxVotes` books. Weighted scoring is 3 points for rank 1, 2 points for rank 2, and 1 point for rank 3. |
| W4 | Partial rankings allowed | If `maxVotes` is greater than 1, a member may still submit only 1 or 2 ranked choices. |
| W5 | Immutable votes | A member cannot change book survey votes after submission. |
| W6 | Survey deadline | Each survey has a close date after which no more votes are accepted. |
| W7 | Results visibility | Results are visible to all after the survey closes or an admin closes it manually. |
| W8 | Tie handling | If there is a tie for top score, the admin manually selects the winner from tied books. This decision is recorded. |
| W9 | Pipeline transition | The winning book moves to `pipeline` and is removed from `wishlist`. |

### Meeting Management

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| M1 | Admin schedules a meeting | Admin sets date, time, location, and may associate a book. |
| M2 | Book association optional | A meeting may exist without an associated book. |
| M3 | One meeting ever per book | A given book may be associated with at most one meeting across the system. |
| M4 | Meeting list | Members see upcoming and past meetings with date, book, and location. |
| M5 | Meeting detail | Detail page shows date, time, location, book, RSVP state, and recap if present. |
| M6 | Date survey | Admin proposes two or more dates. Members vote by selecting multiple acceptable dates. Voting is unranked. Admin confirms the final date. |
| M7 | Date survey deadline | Each date survey has a close date after which no more votes are accepted. |
| M8 | Meeting confirmation effect | When a meeting is confirmed with an associated book, that book status becomes `reading`. |
| M9 | Recap | After a meeting, admin can add a text summary visible to all members. |

### RSVP & Reminder Workflow

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| R1 | RSVP | Members can RSVP `yes`, `no`, or `maybe` before the reminder email is sent. |
| R2 | RSVP updates | Members can change RSVP multiple times until the meeting date. |
| R3 | RSVP closure | RSVPs are closed on the meeting date. |
| R4 | Reminder emails | A reminder email is sent about 7 days before the meeting date, based on Luxembourg timezone and date only. |
| R5 | Follow-up reminders | An optional reminder can be sent 1 day before to members who have not RSVP'd. |
| R6 | Reminder recipients | Reminder emails include admins. |
| R7 | Reminder opt-out | Users can opt out of reminder emails only; other app emails are unaffected. |

### Open Library Search

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| L1 | Book lookup | Users can search Open Library by title or author when adding a book. |
| L2 | Auto-fill | Selecting a result auto-fills title, author, cover URL, description, and Open Library ID when available. |
| L3 | Manual fallback | User can skip search and fill fields manually. |
| L4 | Import failure handling | If metadata import fails or is incomplete, the server logs a warning and the UI shows a non-blocking message so the admin can correct data manually. |
| L5 | Description persistence | Imported descriptions are stored. |
| L6 | Traceability | Imported Open Library IDs are stored. |

### Reading Stats

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| S1 | Club stats page | Shows books read per year and average group rating per book. |
| S2 | Personal stats | Each user sees rating distribution, number of books rated, and average rating given. |
| S3 | Metric definitions | Average group rating uses submitted ratings only, ignoring missing ratings. Books per year is grouped by `dateRead` year. |
| S4 | Computed metrics | Stats are computed from existing books, ratings, and comments data with no new data entry. |

### Dashboard

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| D1 | Current book highlight | Dashboard shows current highlighted book with cover, title, and countdown to next meeting. |
| D2 | User dashboard | Shows book highlight, next meeting, open surveys, and pending RSVP actions. |
| D3 | Admin dashboard | Same as user dashboard plus quick links to admin actions. |

### Admin Utilities

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| U1 | Database export | Admin can export the full SQLite database file, including sensitive and session/auth tables. |
| U2 | Export confirmation | Export requires a confirmation step before download. |

## Data Model

```text
User
  id, email, name, avatarUrl, role (admin|user), active, deletedAt, emailReminderOptOut,
  createdAt, updatedAt

Book
  id, title, author, coverUrl, description, openLibraryId,
  status (wishlist|pipeline|reading|read), dateRead, suggestedByUserId, createdAt, updatedAt

Rating
  id, bookId, userId, score (1-5), createdAt, updatedAt

Comment
  id, bookId, userId, text, isPrivate, createdAt, updatedAt

BookSurvey
  id, title, maxVotes (1-3), closesAt, createdByUserId,
  status (open|closed|tie-break-required), resolvedByUserId, resolvedBookId, createdAt, updatedAt

BookSurveyOption
  id, surveyId, bookId

BookSurveyVote
  id, surveyId, surveyOptionId, userId, rank (1-3), createdAt
  UNIQUE(surveyId, userId, rank)

Meeting
  id, date, time, location, bookId nullable,
  status (scheduled|completed|cancelled), recap nullable, createdAt, updatedAt
  UNIQUE(bookId) where bookId is not null

DateSurvey
  id, meetingId nullable, closesAt, createdByUserId, status (open|closed), createdAt, updatedAt

DateSurveyOption
  id, dateSurveyId, proposedDate

DateSurveyVote
  id, dateSurveyId, dateSurveyOptionId, userId, createdAt
  UNIQUE(dateSurveyId, dateSurveyOptionId, userId)

RSVP
  id, meetingId, userId, status (yes|no|maybe), respondedAt, updatedAt
  UNIQUE(meetingId, userId)
```

## API Routes

```text
Auth
  GET  /auth/google
  GET  /auth/google/callback
  POST /auth/logout
  GET  /auth/me

Users
  GET    /api/users
  POST   /api/users
  PATCH  /api/users/:id
  DELETE /api/users/:id          # soft-delete
  POST   /api/users/:id/reactivate

Books
  GET    /api/books
  GET    /api/books/:id
  POST   /api/books
  PATCH  /api/books/:id
  DELETE /api/books/:id

Wishlist
  POST   /api/wishlist
  GET    /api/wishlist

Ratings
  PUT    /api/books/:id/rating
  GET    /api/books/:id/ratings

Comments
  POST   /api/books/:id/comments
  GET    /api/books/:id/comments
  PATCH  /api/books/:id/comments/:commentId
  DELETE /api/books/:id/comments/:commentId

Book Surveys
  POST   /api/book-surveys
  GET    /api/book-surveys
  GET    /api/book-surveys/:id
  POST   /api/book-surveys/:id/vote
  PATCH  /api/book-surveys/:id/close
  PATCH  /api/book-surveys/:id/resolve-tie

Meetings
  POST   /api/meetings
  GET    /api/meetings
  GET    /api/meetings/:id
  PATCH  /api/meetings/:id
  DELETE /api/meetings/:id

Date Surveys
  POST   /api/date-surveys
  GET    /api/date-surveys/:id
  POST   /api/date-surveys/:id/vote
  PATCH  /api/date-surveys/:id/close

RSVPs
  PUT    /api/meetings/:id/rsvp
  GET    /api/meetings/:id/rsvps

Book Search
  GET    /api/books/search?q=

Stats
  GET    /api/stats/club
  GET    /api/stats/me

Admin Utilities
  GET    /api/admin/export-db
```

## Code Style

Use TypeScript everywhere in strict mode. Prefer small named exports, explicit input validation, and consistent API envelopes.

```ts
export const getBookById = async (req: Request, res: Response) => {
  const parsed = bookIdParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(422).json({
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid book id.' },
    });
  }

  const book = await bookService.getById(parsed.data.id, req.user!.id);

  if (!book) {
    return res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Book not found.' },
    });
  }

  return res.json({ data: book, error: null });
};
```

Conventions:
- TypeScript strict mode only
- ESLint + Prettier
- Functional React components with hooks
- Named exports preferred
- API responses use `{ data, error }`
- Use correct HTTP codes: `401`, `403`, `404`, `422`
- Comments in UI are oldest first
- Private-note access checks must be enforced server-side

## Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Backend unit | Vitest | Services, utilities, scoring logic, reminder scheduling |
| Backend integration | Vitest + supertest | API routes with SQLite test database |
| Frontend unit | Vitest + React Testing Library | Components, hooks, forms, permission-based rendering |
| E2E | Playwright | Critical flows: login, create user, add book, vote, schedule, RSVP |

Required coverage areas:
- auth and role enforcement
- deactivated/soft-deleted user access blocking
- private notes visibility
- immutable book survey voting
- multi-select date survey voting
- reminder opt-out logic
- tie-resolution flow for book surveys
- book-to-meeting uniqueness

## Boundaries

### Always
- Validate all inputs server-side.
- Enforce role-based access on every protected API route.
- Immediately block deactivated or soft-deleted users from active sessions.
- Keep API responses consistent with the `{ data, error }` envelope.
- Store reminder scheduling using Luxembourg timezone rules.
- Preserve historical data when users are soft-deleted.
- Log Open Library import issues on the server and surface a non-blocking UI message.

### Ask first
- Adding new roles beyond `admin` and `user`
- Changing the core data model or unique constraints
- Adding third-party services beyond Google OAuth, Open Library, SMTP, and current tooling
- Changing auth flow or enabling self-registration
- Expanding reminders beyond the defined email workflow

### Never
- Allow self-registration
- Store passwords in v1
- Expose private notes to admins or other users
- Physically delete user historical activity records when a user is soft-deleted
- Expose internal stack traces or raw internal errors to clients
- Implement chat, file sharing, or reading progress tracking in v1

## Success Criteria

The feature is complete when all of the following are true:

1. A seeded initial admin can sign in with Google and create additional users.
2. Non-registered users cannot log in.
3. Deactivated and soft-deleted users are blocked immediately, including existing sessions.
4. Users can suggest books, rate books, write private notes, and write public comments.
5. Private notes are visible only to their author.
6. Admins can create a ranked book survey from wishlist books, members can vote once, and tied surveys can be manually resolved by admin.
7. Winning survey books move from `wishlist` to `pipeline`.
8. Admins can create a multi-select date survey, confirm a final date, and create or update a meeting.
9. A book can be attached to only one meeting ever.
10. Confirming a meeting with a book sets that book to `reading`.
11. Members can RSVP before reminders, update RSVP until the meeting date, and cannot RSVP after the date closes.
12. Reminder emails run on the correct date in Europe/Luxembourg timezone, include admins, and respect reminder-only opt-out.
13. Open Library search supports autofill, stores Open Library ID and description, and degrades gracefully when metadata is incomplete.
14. Stats pages correctly show books per year and average group ratings.
15. Admin can export the live SQLite database after a confirmation step, including sensitive/session tables.
16. `npm run dev`, `npm run build`, `npm run lint`, `npm test`, and `npm run e2e` all succeed.

## Open Questions

None for v1 at this time. Apple Sign In is explicitly deferred post-v1.

## Out of Scope

- Apple Sign In in v1
- Chat or messaging
- File sharing
- Reading progress tracking
- Native mobile app
- Multi-club support
