# Spec: Simple Book Club Manager

## Objective

Build a very small, self-hosted web application for managing one informal book club of up to 30 members with no required paid services.

The product goal is not to create a polished SaaS platform. The goal is to give a small club one simple place to answer the recurring questions:

- What are we reading now?
- What books have been suggested?
- Which book should we read next?
- When and where is the next meeting?
- Who is coming?
- What have we already read?

Success for v1 means the club can run its core operating loop in the app:

1. Admin adds members manually.
2. Members sign in.
3. Members suggest books.
4. Members vote on suggested books.
5. Admin selects the next/current book.
6. Admin schedules a meeting.
7. Members RSVP.
8. After the meeting, admin marks the book as read and the club keeps history.

Visual and interaction standards for future UI work live in `UX_UI_SPEC.md`.

## Product Constraints

- The app is for one small book club, not a multi-club SaaS product.
- Target club size is fewer than 30 members.
- The app should be understandable and maintainable by a non-technical club admin.
- The app must not require paid third-party services.
- The app must work without outbound email configured.
- Prefer manual admin workflows over automation when automation adds setup, infrastructure, or maintenance complexity.
- Prefer fewer concepts and fewer screens over highly configurable workflows.
- v1 should prioritize the shortest path to running book selection and meeting planning.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React (Vite), React Router, TanStack Query |
| UI | Tailwind CSS + shadcn/ui components |
| Backend | Node.js, Express |
| Database | SQLite via `better-sqlite3` |
| ORM | Drizzle ORM |
| Auth | Session-based email/password auth with admin-created users |
| Email | Not required in v1 |
| Scheduler | Not required in v1 |
| Monorepo | npm workspaces |
| Runtime | Node.js 20+ |
| Timezone | Europe/Luxembourg |

## Deployment Constraints

- Must run locally or on a free/low-cost self-hosted environment.
- Must not require paid databases, paid auth providers, paid email providers, or paid hosting.
- SQLite is the only required persistence layer.
- Backups are handled by downloading or copying the SQLite database file.
- v1 should not depend on SMTP, background workers, cron jobs, or external paid APIs.

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
  SPEC.md                   # living product specification
  UX_UI_SPEC.md             # visual and interaction guidance
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
        services/           # Business logic
        index.ts            # Server entry point
      package.json
    shared/                 # Shared types and constants
      src/
        types.ts
        constants.ts
      package.json
```

## V1 Scope

V1 includes only the minimum required to run the book club.

### Authentication & Member Management

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| A1 | Email + password login | Members and admins can sign in with email and password. No self-registration. |
| A2 | Initial admin bootstrap | One initial admin can be created through a seed/bootstrap flow. |
| A3 | Manual user creation | Admin can create a member with email, name, role, and a temporary password. The admin shares credentials outside the app. |
| A4 | Password change | A signed-in user can change their own password. |
| A5 | Admin manages users | Admin can list users, edit name/email/role, deactivate users, reactivate users, and soft-delete users. |
| A6 | Access revocation | Deactivated or soft-deleted users cannot log in and are blocked from protected API requests. |
| A7 | Historical retention | Ratings, comments, votes, and RSVPs remain after user soft-delete. |
| A8 | Role enforcement | Admin-only actions are blocked for regular users in both API and UI. |

### Books & Reading History

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| B1 | Book list | Members can view all books grouped or filtered by status. |
| B2 | Book details | Each book page shows title, author, optional cover URL, optional description, status, date read, ratings, and comments. |
| B3 | Book statuses | Supported statuses are `suggested`, `selected`, `reading`, and `read`. |
| B4 | Member suggestions | Any member can suggest a book with title, author, and optional description/link/cover URL. Suggested books have status `suggested`. |
| B5 | Admin book management | Admin can add, edit, delete, and change status for books. |
| B6 | Current book | At most one book should be treated as the main current `reading` book in the UI, even if historical data permits more than one. |
| B7 | Mark as read | Admin can mark a book as `read` and set `dateRead`. |
| B8 | Per-user ratings | Each member can rate a read book from 1 to 5 once and later update the rating. |
| B9 | Public comments | Each member can leave public comments on a book. Comments are visible to all members and ordered oldest first. |
| B10 | Comment moderation | Members can edit/delete their own comments. Admins can delete any comment. |

### Simple Book Voting

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| V1 | Vote on suggested books | Members can vote for suggested books they would like to read. |
| V2 | One vote per member per book | A member can vote for or remove their vote from each suggested book. |
| V3 | Vote counts | Members can see vote counts for suggested books. |
| V4 | Admin selection | Admin can select a suggested book as the next book, changing its status to `selected`. |
| V5 | Manual tie handling | If vote counts are tied or ambiguous, admin decides manually. The app does not need automated tie-breaking. |

### Meetings & RSVPs

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| M1 | Admin schedules a meeting | Admin sets date, time, location, and optionally associates a book. |
| M2 | Meeting list | Members see upcoming and past meetings with date, time, location, associated book, and RSVP summary. |
| M3 | Meeting detail | Detail page shows date, time, location, associated book, RSVP state, attendee counts, and optional recap. |
| M4 | RSVP | Members can RSVP `yes`, `no`, or `maybe`. |
| M5 | RSVP updates | Members can change RSVP until the meeting date. |
| M6 | RSVP closure | RSVPs are closed on or after the meeting date. |
| M7 | Meeting recap | After a meeting, admin can add a short text recap visible to all members. |
| M8 | Status convenience | Admin can mark the associated book as `reading` or `read` from the meeting workflow when useful. |

### Home Page / Dashboard

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| D1 | Simple home page | Members see the current/selected book, next meeting, their RSVP state, and suggested books with votes. |
| D2 | Member action feedback | Rating, voting, RSVPing, suggesting books, and posting comments provide visible success/error feedback. |
| D3 | Admin shortcuts | Admins see simple links/actions for adding books, managing members, scheduling meetings, and exporting a backup. |
| D4 | First-run guidance | Admin sees lightweight first-run guidance for creating members, adding suggested books, and scheduling the first meeting. |

### Manual Reminder Helper

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| R1 | Copy reminder text | Admin can copy generated reminder text for the next meeting, including book title, date, time, location, and RSVP prompt. |
| R2 | No automated delivery | v1 does not send emails or scheduled reminders. Admin shares reminder text manually through chat/email outside the app. |

### Admin Utilities

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| U1 | Database export | Admin can export the full SQLite database file, including auth/session tables. |
| U2 | Export confirmation | Export requires a confirmation step before download. |

## Post-v1 Scope

These features are intentionally deferred until the core club workflow is working and the club has proven it needs them:

- Email invite links
- Password reset emails
- SMTP/Nodemailer setup
- Automated reminder emails
- Background scheduler / cron jobs
- Reminder opt-out preferences
- Open Library search and metadata import
- Private personal notes
- Personal reading stats
- Club analytics dashboards
- Ranked/weighted book surveys
- Dedicated date surveys
- Advanced tie-resolution workflows
- Multi-club support
- Third-party SSO providers
- Native mobile app
- Chat or messaging
- File sharing
- Reading progress tracking

## Data Model

```text
User
  id, email, passwordHash, name, role (admin|user), active, deletedAt,
  createdAt, updatedAt

Book
  id, title, author, coverUrl nullable, description nullable, externalLink nullable,
  status (suggested|selected|reading|read), dateRead nullable,
  suggestedByUserId nullable, createdAt, updatedAt

BookVote
  id, bookId, userId, createdAt
  UNIQUE(bookId, userId)

Rating
  id, bookId, userId, score (1-5), createdAt, updatedAt
  UNIQUE(bookId, userId)

Comment
  id, bookId, userId, text, createdAt, updatedAt

Meeting
  id, date, time, location, bookId nullable,
  status (scheduled|completed|cancelled), recap nullable, createdAt, updatedAt

RSVP
  id, meetingId, userId, status (yes|no|maybe), respondedAt, updatedAt
  UNIQUE(meetingId, userId)
```

## API Routes

```text
Auth
  POST /auth/login
  POST /auth/logout
  GET  /auth/me
  GET  /auth/csrf
  POST /auth/change-password

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
  POST   /api/books/:id/vote
  DELETE /api/books/:id/vote
  PUT    /api/books/:id/rating
  POST   /api/books/:id/comments
  PATCH  /api/books/:id/comments/:commentId
  DELETE /api/books/:id/comments/:commentId

Meetings
  GET    /api/meetings
  GET    /api/meetings/:id
  POST   /api/meetings
  PATCH  /api/meetings/:id
  DELETE /api/meetings/:id
  PUT    /api/meetings/:id/rsvp
  GET    /api/meetings/:id/rsvps
  GET    /api/meetings/:id/reminder-text

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

- TypeScript strict mode only.
- ESLint + Prettier.
- Functional React components with hooks.
- Named exports preferred.
- API responses use `{ data, error }`.
- Use correct HTTP codes: `401`, `403`, `404`, `422`.
- Comments in UI are oldest first.
- State-changing client requests use CSRF protection when cookie-based auth is active.
- Admin creation flows should provide visible success/error feedback rather than relying only on list refreshes.
- Member save actions should provide immediate visible feedback.
- Use shared toast/banner patterns rather than ad hoc copy where possible.
- Form labels and action copy should use consistent title casing across the admin workflow.
- After successful create actions, prefer offering a contextual next step, such as opening the created record.
- Avoid adding abstractions for future features until v1 needs them.

## Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Backend unit | Vitest | Services, utilities, vote logic, password utilities |
| Backend integration | Vitest + supertest | API routes with SQLite test database |
| Frontend unit | Vitest + React Testing Library | Components, hooks, forms, permission-based rendering |
| E2E | Playwright | Critical flows: login, create user, suggest book, vote, schedule meeting, RSVP |

Required coverage areas:

- auth and role enforcement
- deactivated/soft-deleted user access blocking
- manual user creation and password change
- suggested book voting
- selecting a book from suggestions
- ratings and public comments
- RSVP creation and updates
- database export authorization

## Boundaries

### Always

- Validate all inputs server-side.
- Enforce role-based access on every protected API route.
- Block deactivated or soft-deleted users from protected API requests.
- Keep API responses consistent with the `{ data, error }` envelope.
- Preserve historical data when users are soft-deleted.
- Protect state-changing routes with CSRF validation for cookie-authenticated sessions.
- Keep security headers and rate limiting enabled on production-facing routes.
- Prefer simple manual workflows over automated infrastructure in v1.
- Keep the data model small unless a v1 requirement clearly needs another table.

### Ask first

- Adding email sending or SMTP configuration.
- Adding cron jobs, queues, background workers, or schedulers.
- Adding Open Library or other third-party integrations.
- Adding new roles beyond `admin` and `user`.
- Changing the core data model or unique constraints.
- Changing auth flow or enabling self-registration.
- Adding ranked surveys, date surveys, stats, or private notes back into v1.
- Adding any new paid service or dependency that requires an account.

### Never

- Allow self-registration in v1.
- Store plaintext passwords.
- Expose internal stack traces or raw internal errors to clients.
- Physically delete user historical activity records when a user is soft-deleted.
- Require paid services for core functionality.
- Require email delivery for onboarding or reminders in v1.
- Implement chat, file sharing, native mobile, multi-club support, or reading progress tracking in v1.

## Success Criteria

The v1 app is complete when all of the following are true:

1. A seeded initial admin can sign in with email and password.
2. Admin can manually create a member with a temporary password.
3. A manually created member can sign in and change their password.
4. Non-registered users cannot log in.
5. Deactivated and soft-deleted users are blocked from protected app access.
6. Admin can add, edit, delete, and change status for books.
7. Members can suggest books.
8. Members can vote for and unvote suggested books.
9. Vote counts are visible on suggested books.
10. Admin can manually select the next book from suggestions.
11. Members can view the current/selected book and reading history.
12. Members can rate read books from 1 to 5 and update their rating.
13. Members can post public comments on books.
14. Admin can schedule, edit, cancel, and view meetings.
15. Members can RSVP `yes`, `no`, or `maybe` and update their RSVP until the meeting date.
16. Admin can add a meeting recap after the meeting.
17. The home page clearly shows current/selected book, next meeting, RSVP state, and suggested books.
18. Admin can copy generated reminder text and share it manually outside the app.
19. Admin can export the SQLite database after a confirmation step.
20. Core admin and member actions provide clear success/error feedback in the UI.
21. `npm run dev`, `npm run build`, `npm run lint`, `npm test`, and `npm run e2e` all succeed.

## Open Questions

None for v1 at this time.

## Out of Scope for V1

- Email-based invite flow
- Forgot-password email flow
- Automated reminders
- Open Library integration
- Private notes
- Personal stats and analytics dashboards
- Ranked/weighted surveys
- Date surveys
- Third-party SSO providers
- Chat or messaging
- File sharing
- Reading progress tracking
- Native mobile app
- Multi-club support
