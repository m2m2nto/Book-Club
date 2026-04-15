# Book Club Manager — Implementation Plan

## Context

Building a greenfield self-hosted web app for managing a small book club (up to 30 members). Tech stack: React (Vite) + Express + SQLite (Drizzle ORM) + Passport.js + Nodemailer, monorepo with npm workspaces.

## Phases Overview

| Phase | Name | Tasks | Checkpoint |
|-------|------|-------|------------|
| 1 | Project Scaffolding | 8 | `npm run dev` starts client + server, health check works |
| 2 | Authentication & Users | 6 | Admin logs in via Google, creates user, role enforcement works |
| 3 | Book Management & Search | 8 | Books with ratings, comments, Open Library search |
| 4 | Wishlist & Book Surveys | 4 | Suggest → poll → ranked vote → winner to pipeline |
| 5 | Meetings & RSVP | 6 | Date surveys, meeting scheduling, RSVP |
| 6 | Email Reminders | 2 | Automated 7-day + 1-day reminders |
| 7 | Dashboard, Stats & Polish | 7 | Feature-complete with E2E tests |

**Total: 34 tasks across 7 phases.**

---

## Phase 1: Project Scaffolding

**Goal:** Running monorepo with dev servers, shared types, DB connection, and test infrastructure.

### 1.1 — Initialize monorepo and workspace structure
- Create root `package.json` with npm workspaces: `packages/client`, `packages/server`, `packages/shared`
- Root `tsconfig.base.json` with `strict: true`, each workspace extends it
- **Verify:** `npm install` succeeds, cross-workspace imports work

### 1.2 — ESLint, Prettier, and shared tooling
- ESLint flat config + Prettier at root, TypeScript-aware
- `.gitignore` (node_modules, dist, .env, *.db), `.editorconfig`
- **Verify:** `npm run lint` and `npm run format:check` pass

### 1.3 — Express server with health endpoint
- `packages/server`: Express + `GET /api/health` → `{ data: { status: "ok" } }`
- Use `tsx` for dev mode
- **Verify:** `curl localhost:3000/api/health` returns 200

### 1.4 — Vite React client with proxy and shell layout
- `packages/client`: Vite + React + TypeScript + Tailwind + shadcn/ui
- Proxy `/api` and `/auth` to server, React Router, TanStack Query
- Shell layout (sidebar/nav) + home page fetching health check
- **Verify:** `localhost:5173` renders styled page with health status

### 1.5 — Shared types package
- `ApiResponse<T>`, `UserRole`, `BookStatus`, `SurveyStatus`, `MeetingStatus`, `RsvpStatus`
- **Verify:** Both server and client compile when importing from `@book-club/shared`

### 1.6 — Drizzle ORM and SQLite database
- `drizzle-orm`, `better-sqlite3`, `drizzle-kit`
- `users` table schema, initial migration, `npm run db:migrate`
- **Verify:** Migration runs, insert/select user works

### 1.7 — Vitest for backend and frontend
- Server: health endpoint test with supertest
- Client: App render smoke test
- Root `npm test` runs all
- **Verify:** `npm test` — 2+ green tests

### 1.8 — Root dev script and environment config
- `concurrently` for parallel server + client dev
- `.env.example` documenting all env vars, `dotenv` in server
- **Verify:** `npm run dev` starts everything

---

## Phase 2: Authentication & User Management

**Goal:** SSO login, session management, admin CRUD for users, role enforcement.

### 2.1 — Session and Passport.js infrastructure
- `express-session` with SQLite store, Passport serialize/deserialize
- `requireAuth` (401) and `requireAdmin` (403) middleware
- `GET /auth/me` returns current user
- **Verify:** Integration tests for 401/403 responses

### 2.2 — Google OAuth login flow
- `passport-google-oauth20` strategy
- `/auth/google` + `/auth/google/callback`
- Only pre-registered emails allowed, store name + avatar from profile
- **Verify:** Mock strategy test, session created for registered user

### 2.3 — Admin user management API
- `POST /api/users` (create by email), `GET /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id`
- All admin-only, input validation, duplicate email → 422
- **Verify:** Integration tests: CRUD cycle, 403 for non-admin

### 2.4 — Seed script for initial admin user
- `npm run db:seed` — creates admin from `ADMIN_EMAIL` env var, idempotent
- **Verify:** Run twice, still one admin row

### 2.5 — Login page and auth UI
- `/login` page with Google button
- `useAuth` hook (calls `/auth/me`), `ProtectedRoute` wrapper
- Nav shows user name/avatar, logout button
- **Verify:** Unauthenticated → redirect to login, login → see nav, logout → back to login

### 2.6 — Admin user management UI
- `/admin/users` page: user table, "Add User" dialog, activate/deactivate toggle, delete with confirm
- TanStack Query for data fetching
- Hidden from non-admin nav
- **Verify:** Full CRUD via UI

---

## Phase 3: Book Management & Search

**Goal:** Full book catalog with ratings, comments, and Open Library integration.

### 3.1 — Book database schema
- `books`, `ratings` (unique bookId+userId), `comments` (isPrivate flag) tables
- **Verify:** Migration runs, unique constraint works

### 3.2 — Book CRUD API
- `GET /api/books` (filter by status), `GET /api/books/:id` (with avg rating)
- `POST/PATCH/DELETE` admin only, cascade delete
- **Verify:** Integration tests for CRUD + filter + cascade

### 3.3 — Ratings API
- `PUT /api/books/:id/rating` (upsert 1-5), `GET /api/books/:id/ratings`
- **Verify:** Rate, re-rate (update not duplicate), invalid score → 422

### 3.4 — Comments API
- `POST /api/books/:id/comments` (public or private note)
- `GET` returns public + own private, `DELETE` own or admin
- **Verify:** Privacy enforcement, delete permissions

### 3.5 — Open Library search proxy
- `GET /api/books/search?q=` → top 10 results with title, author, coverUrl
- In-memory cache (5 min TTL)
- **Verify:** Mock HTTP test, manual curl

### 3.6 — Book list and detail pages
- `/books` grid with covers, status filter tabs
- `/books/:id` with book info, all ratings, comments thread
- **Verify:** Filter tabs work, private notes only visible to owner

### 3.7 — Rating and comment UI components
- Star widget (clickable 1-5), comment form with "private note" checkbox
- Optimistic updates via TanStack Query
- **Verify:** Rate persists on refresh, comments appear without reload

### 3.8 — Admin book management with Open Library search
- "Add Book" form with debounced Open Library search + auto-fill
- Edit/delete on detail page (admin only)
- **Verify:** Search "sapiens", auto-fill, save, edit, delete

---

## Phase 4: Wishlist & Book Surveys

**Goal:** Democratic book selection via wishlist suggestions and ranked voting.

### 4.1 — Wishlist API and UI
- `POST/GET /api/wishlist`, creates book with `status: wishlist`
- `/wishlist` page with Open Library search in suggest form
- **Verify:** Suggest book, see it on wishlist and in books list

### 4.2 — Book survey database schema
- `bookSurveys` (maxVotes 1-3), `bookSurveyOptions`, `bookSurveyVotes` (rank 1-3)
- Unique constraint: (surveyId, userId, rank)
- **Verify:** Migration runs, constraint works

### 4.3 — Book survey API
- Create from wishlist books, ranked multi-vote (3/2/1 pts scoring)
- Votes are immutable after submission, deadline enforcement, close → winner to pipeline
- Tie handling requires admin selection of one winner from tied books
- **Verify:** Full lifecycle integration test

### 4.4 — Book survey UI
- `/surveys` list, `/surveys/:id` with rank voting interface
- Admin: create from wishlist, close survey
- Closed: show results with scores and winner
- **Verify:** Manual full flow

---

## Phase 5: Meetings, Date Surveys & RSVP

**Goal:** Complete meeting lifecycle from date polling to RSVP.

### 5.1 — Meeting and date survey schema
- `meetings` (with recap), `dateSurveys`, options, votes, `rsvps`
- **Verify:** Migration runs

### 5.2 — Meeting CRUD API
- Create (linked to book), list (upcoming first), detail (with RSVP counts), recap via PATCH
- **Verify:** Integration tests

### 5.3 — RSVP API
- `PUT` upsert (yes/no/maybe), `GET` list per meeting
- No RSVP on cancelled meetings
- **Verify:** RSVP, change, list, reject on cancelled

### 5.4 — Date survey API
- Create with 2+ dates, multi-select availability voting, close + confirm → create meeting
- **Verify:** Full lifecycle with meeting creation

### 5.5 — Meeting list and detail pages
- Upcoming + past sections, RSVP buttons, recap display
- Admin: edit, cancel, add recap
- **Verify:** Manual walkthrough

### 5.6 — Date survey UI
- Date picker for options, vote interface, results, admin close + confirm
- **Verify:** Full flow ending in meeting creation

---

## Phase 6: Email Reminders

**Goal:** Automated email notifications for meetings.

### 6.1 — Email service and templates
- Nodemailer + SMTP, 3 templates (7-day, RSVP request, 1-day follow-up)
- Dev mode: log to console
- **Verify:** Template rendering tests, dev mode logging

### 6.2 — Cron scheduler for reminders
- Daily job: 7-day reminder to all, 1-day to non-RSVPd
- Respect reminder-only opt-out, use Europe/Luxembourg date rules, deduplication via tracking table
- **Verify:** Unit test with mocked dates, opt-out coverage, dedup verification

---

## Phase 7: Dashboard, Stats & Polish

**Goal:** Feature-complete, polished app with E2E tests.

### 7.1 — Dashboard API
- Current book + countdown, next meeting + RSVP status, open surveys, pending RSVPs
- Admin: summary counts
- **Verify:** Integration test with seeded data

### 7.2 — Dashboard UI
- Book-of-the-month banner, meeting/survey/RSVP cards, admin quick actions
- Graceful empty states
- **Verify:** All sections populate correctly

### 7.3 — Stats API
- Club: books/year, avg ratings
- Personal: rating distribution, avg given, comment count
- **Verify:** Integration test with seeded data

### 7.4 — Stats UI
- Club + Personal tabs, recharts bar charts, counters
- **Verify:** Charts render with seeded data

### 7.5 — Admin database export
- `GET /api/admin/export-db` → download `.db` file with date in filename
- **Verify:** Download, open with sqlite3, verify data

### 7.6 — Playwright E2E tests
- 6 critical flows: login, create user, add book, rate, vote, RSVP
- Test seed script, headless mode
- **Verify:** `npx playwright test` all green

### 7.7 — Navigation and responsive polish
- Complete nav links, mobile hamburger menu, loading skeletons, error boundaries, 404 page
- Admin nav items hidden for non-admins
- **Verify:** Desktop + mobile walkthrough, no dead links

### 7.8 — Security hardening and launch verification
- Add CSRF protection, stricter session handling, security headers, auth/API rate limiting, and broader Zod validation at route boundaries
- Stabilize root build and E2E workflows so `npm run build` and `npm run e2e` both pass reliably
- Document launch readiness, rollback, and remaining operational blockers
- **Verify:** `npm run lint`, `npm run build`, `npm test`, `npm run e2e`, `npm audit --audit-level=high`

### 7.9 — Admin onboarding and UX polish
- Add clearer success/error feedback to core admin creation flows
- Add first-run guidance/checklist on the admin dashboard
- Normalize admin form labels and action copy for consistency
- **Verify:** Real-browser admin first-steps walkthrough feels smooth and discoverable

### 7.10 — Shared toast system and member UX polish
- Add a reusable client-side toast/notification system for save success and failure feedback
- Add contextual post-create actions like “Open survey” or “Open meeting” after successful admin create flows
- Run a real-browser member journey pass and address any obvious feedback/discoverability issues for rating, commenting, voting, and RSVPing
- **Verify:** Member-facing actions feel responsive and self-explanatory in a real-browser walkthrough

---

## Architecture Decisions

1. **`{ data, error }` envelope** on every API endpoint
2. **Drizzle migrations** — additive per phase, `schema.ts` is source of truth
3. **Per-route auth middleware** — `requireAuth`/`requireAdmin` not global
4. **TanStack Query** for all server state — no Redux needed
5. **Ranked vote scoring** (3/2/1 pts) computed at query time
6. **Email deduplication** via tracking table
