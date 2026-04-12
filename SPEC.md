# Book Club Manager — Specification

## 1. Objective

A self-hosted web application for managing a small book club (up to 30 members). It tracks books read, lets members suggest and vote on future reads, handles meeting scheduling with date polls, and sends email reminders with RSVP confirmation.

**Target users:** A small group of friends/colleagues in a book club.
**Roles:**
- **Admin** — manages users, books, meetings, and surveys.
- **User** — views books, submits ratings/comments, suggests books, votes in surveys, RSVPs to meetings.

---

## 2. Features & Acceptance Criteria

### 2.1 Authentication & User Management

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| A1 | Google SSO login | Users can sign in via Google OAuth 2.0. No self-registration. |
| A2 | Apple SSO login | Users can sign in via Apple Sign In. No self-registration. |
| A3 | Admin creates users | Admin adds a user by email. Only pre-registered emails can log in via SSO. |
| A4 | Admin manages users | Admin can list, deactivate, and delete users. |
| A5 | Role enforcement | Admin-only actions are blocked for regular users (API + UI). |

### 2.2 Book Management

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| B1 | Book history | List of all books the club has read, ordered by date read, with cover, title, author. |
| B2 | Book details | Each book page shows: title, author, cover image, date read, per-user ratings, notes, and comments. |
| B3 | Admin adds/edits/deletes books | Admin can manage the book catalog (title, author, cover image URL, date read, status). |
| B4 | Book statuses | A book is one of: `read`, `reading` (current), `pipeline` (selected for upcoming meeting), `wishlist`. |
| B5 | Per-user ratings | Each user can rate a book (1-5 stars) once, and update their rating. |
| B6 | Per-user notes & comments | Each user can leave notes (private) and comments (visible to all) on a book. |

### 2.3 Book Wishlist & Book Survey

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| W1 | Any user suggests a book | Any member can add a book to the wishlist (title, author, optional description/link). |
| W2 | Admin creates book survey | Admin selects N books from the wishlist and creates a poll with a configurable max votes (default: 1, up to 3). |
| W3 | Ranked multi-vote | Members can vote for up to `maxVotes` books per survey, ranked by preference (1st choice = 3 pts, 2nd = 2, 3rd = 1). |
| W4 | Book survey results | Results are visible to all after voting closes (or admin closes it). Winning book moves to `pipeline`. Ranked by weighted score. |
| W5 | Survey deadline | Each survey has a closing date after which no more votes are accepted. |

### 2.4 Meeting Management

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| M1 | Admin schedules a meeting | Admin sets date, time, location (physical or link), and associates a book. |
| M2 | Meeting list | All members see upcoming and past meetings with date, book, and location. |
| M3 | Meeting detail | Shows date, time, location, associated book, and RSVP status of all members. |
| M4 | Date survey | Admin proposes 2+ date options. Members vote on their preferred/available dates. Admin confirms final date. |
| M5 | Email reminder | ~7 days before a meeting, an email is sent to all members requesting RSVP confirmation. |
| M6 | RSVP | Members confirm (yes/no/maybe) attendance. RSVP status visible on meeting detail. |
| M7 | Reminder follow-up | Optional: 1 day before, a final reminder is sent to members who haven't RSVP'd. |

### 2.5 Book Search (Open Library)

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| L1 | Book lookup | When adding a book (wishlist or catalog), user can search by title/author via Open Library API. |
| L2 | Auto-fill fields | Selecting a search result auto-fills title, author, cover image URL, and description. |
| L3 | Manual fallback | User can skip search and fill fields manually if the book isn't found. |

### 2.6 Meeting Recap

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| R1 | Admin adds recap | After a meeting, admin can add a text summary/notes to the meeting record. |
| R2 | Recap visible to all | Meeting recap is shown on the meeting detail page for all members. |

### 2.7 Reading Stats

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| S1 | Club stats page | Shows: books read per year, average group rating per book, most active commenter. |
| S2 | Personal stats | Each user sees: their rating distribution, number of books rated, average rating given. |
| S3 | Computed from existing data | No new data entry required — stats derived from books, ratings, and comments tables. |

### 2.8 Dashboard

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| D1 | Book of the month highlight | Dashboard banner shows current book with cover, title, and countdown to next meeting ("12 days left"). |
| D2 | User dashboard | Shows: book highlight, next meeting, open surveys (book + date), pending RSVP. |
| D3 | Admin dashboard | Same as user + quick links to create users, meetings, surveys. |

### 2.9 Admin Utilities

| # | Feature | Acceptance Criteria |
|---|---------|-------------------|
| U1 | Database export | Admin can download the full SQLite database file as a backup via a single button/endpoint. |

---

## 3. Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React (Vite), React Router, TanStack Query |
| UI | Tailwind CSS + shadcn/ui components |
| Backend | Node.js, Express |
| Database | SQLite (via better-sqlite3) |
| ORM | Drizzle ORM |
| Auth | Passport.js (Google OAuth 2.0 + Apple Sign In) |
| Email | Nodemailer (SMTP configuration) |
| Scheduler | node-cron (for email reminders) |
| Monorepo | npm workspaces |
| Runtime | Node.js 20+ |

---

## 4. Project Structure

```
book-club/
  package.json              # workspace root
  packages/
    client/                 # React frontend
      src/
        components/         # Reusable UI components
        pages/              # Route pages
        hooks/              # Custom React hooks
        lib/                # API client, utils
        App.tsx
        main.tsx
      index.html
      vite.config.ts
      package.json
    server/                 # Express backend
      src/
        routes/             # Express route handlers
        middleware/          # Auth, role guards
        db/
          schema.ts         # Drizzle schema
          migrations/       # SQL migrations
        services/           # Business logic (email, scheduling)
        index.ts            # Entry point
      package.json
    shared/                 # Shared types & constants
      src/
        types.ts            # API request/response types
        constants.ts
      package.json
```

---

## 5. Data Model (Key Entities)

```
User
  id, email, name, avatarUrl, role (admin|user), active, createdAt

Book
  id, title, author, coverUrl, description, status (wishlist|pipeline|reading|read),
  dateRead, suggestedBy (userId), createdAt

Rating
  id, bookId, userId, score (1-5), createdAt, updatedAt

Comment
  id, bookId, userId, text, isPrivate (note vs comment), createdAt

BookSurvey
  id, title, maxVotes (1-3), closesAt, createdBy, status (open|closed), createdAt

BookSurveyOption
  id, surveyId, bookId

BookSurveyVote
  id, surveyOptionId, userId, rank (1-3), createdAt
  UNIQUE(surveyId, userId, rank) — one vote per rank per user per survey

Meeting
  id, date, time, location, bookId, status (scheduled|completed|cancelled), recap (text, nullable), createdAt

DateSurvey
  id, meetingId (nullable until confirmed), closesAt, createdBy, status (open|closed)

DateSurveyOption
  id, dateSurveyId, proposedDate

DateSurveyVote
  id, dateSurveyOptionId, userId, createdAt
  UNIQUE(dateSurveyId, userId) — one vote per user per survey

RSVP
  id, meetingId, userId, status (yes|no|maybe), respondedAt
```

---

## 6. API Routes (Overview)

```
Auth
  GET  /auth/google          — Initiate Google OAuth
  GET  /auth/google/callback  — Google OAuth callback
  GET  /auth/apple           — Initiate Apple Sign In
  GET  /auth/apple/callback   — Apple Sign In callback
  POST /auth/logout          — Log out
  GET  /auth/me              — Get current user

Users (admin only, except GET /me)
  GET    /api/users
  POST   /api/users           — { email, name, role }
  PATCH  /api/users/:id
  DELETE /api/users/:id

Books
  GET    /api/books            — List (filter by status)
  GET    /api/books/:id
  POST   /api/books            — Admin: add book
  PATCH  /api/books/:id        — Admin: edit book
  DELETE /api/books/:id        — Admin: delete book

Wishlist
  POST   /api/wishlist         — Any user suggests a book
  GET    /api/wishlist         — List wishlist books

Ratings
  PUT    /api/books/:id/rating — Upsert user's rating
  GET    /api/books/:id/ratings

Comments
  POST   /api/books/:id/comments
  GET    /api/books/:id/comments
  DELETE /api/books/:id/comments/:commentId  — Own or admin

Book Surveys
  POST   /api/book-surveys           — Admin: create
  GET    /api/book-surveys
  GET    /api/book-surveys/:id
  POST   /api/book-surveys/:id/vote  — User votes
  PATCH  /api/book-surveys/:id/close — Admin: close survey

Meetings
  POST   /api/meetings              — Admin: create
  GET    /api/meetings
  GET    /api/meetings/:id
  PATCH  /api/meetings/:id          — Admin: edit
  DELETE /api/meetings/:id          — Admin: cancel

Date Surveys
  POST   /api/date-surveys           — Admin: create
  GET    /api/date-surveys/:id
  POST   /api/date-surveys/:id/vote
  PATCH  /api/date-surveys/:id/close — Admin: close & confirm date

RSVPs
  PUT    /api/meetings/:id/rsvp     — Upsert RSVP
  GET    /api/meetings/:id/rsvps

Book Search
  GET    /api/books/search?q=       — Proxy to Open Library API, returns title/author/cover matches

Stats
  GET    /api/stats/club            — Club-wide stats (books/year, avg ratings, top commenter)
  GET    /api/stats/me              — Personal stats for current user

Admin Utilities
  GET    /api/admin/export-db       — Download SQLite database file (admin only)
```

---

## 7. Code Style

- **TypeScript** everywhere (strict mode).
- **ESLint** + **Prettier** for formatting.
- Functional React components with hooks.
- Named exports preferred.
- API responses follow `{ data, error }` envelope.
- HTTP error codes used correctly (401, 403, 404, 422).

---

## 8. Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Backend unit | Vitest | Services, utilities |
| Backend integration | Vitest + supertest | API routes with in-memory SQLite |
| Frontend unit | Vitest + React Testing Library | Components, hooks |
| E2E | Playwright | Critical flows (login, rate book, vote, RSVP) |

---

## 9. Boundaries

### Always Do
- Validate all inputs server-side.
- Enforce role-based access on every API route.
- Use parameterized queries (Drizzle handles this).
- Return consistent error responses.
- Use HTTPS in production.

### Ask First
- Adding new roles beyond admin/user.
- Changing the data model.
- Adding new third-party integrations.
- Any changes to the auth flow.

### Never Do
- Allow self-registration (admin-only user creation).
- Store passwords (SSO only).
- Implement chat, file sharing, or reading progress in v1.
- Expose internal errors to the client.

---

## 10. Out of Scope (v1)

- Chat / messaging
- File sharing
- Reading progress tracking
- Mobile native app (responsive web only)
- Multi-club support (single club instance)
