# Book Club Manager — Task Checklist

## Phase 1: Project Scaffolding
- [x] 1.1  Initialize monorepo and workspace structure
- [x] 1.2  Configure ESLint, Prettier, and shared tooling
- [x] 1.3  Set up Express server with health endpoint
- [x] 1.4  Set up Vite React client with proxy and shell layout
- [x] 1.5  Set up shared types package
- [x] 1.6  Set up Drizzle ORM and SQLite database
- [x] 1.7  Set up Vitest for backend and frontend
- [x] 1.8  Add root dev script and environment configuration
> **Checkpoint:** `npm run dev` starts both servers, health check works end-to-end

## Phase 2: Authentication & User Management
- [x] 2.1  Implement session and Passport.js infrastructure
- [x] 2.2  Implement Google OAuth login flow
- [x] 2.3  Admin user management API
- [x] 2.4  Seed script for initial admin user
- [x] 2.5  Login page and auth UI
- [x] 2.6  Admin user management UI
> **Checkpoint:** Admin logs in via Google, creates a user, that user logs in, non-admin blocked

## Phase 3: Book Management & Search
- [x] 3.1  Book database schema (books, ratings, comments)
- [x] 3.2  Book CRUD API
- [x] 3.3  Ratings API
- [x] 3.4  Comments API
- [x] 3.5  Open Library search proxy API
- [x] 3.6  Book list and detail pages (UI)
- [x] 3.7  Book rating and comment UI components
- [x] 3.8  Admin book management UI with Open Library search
> **Checkpoint:** Admin adds book via Open Library, users rate and comment

## Phase 4: Wishlist & Book Surveys
- [ ] 4.1  Wishlist API and UI
- [ ] 4.2  Book survey database schema
- [ ] 4.3  Book survey API (create, ranked vote, close, scoring)
- [ ] 4.4  Book survey UI (voting interface, results)
> **Checkpoint:** User suggests book → admin creates poll → members vote → winner to pipeline

## Phase 5: Meetings, Date Surveys & RSVP
- [ ] 5.1  Meeting and date survey database schema
- [ ] 5.2  Meeting CRUD API
- [ ] 5.3  RSVP API
- [ ] 5.4  Date survey API
- [ ] 5.5  Meeting list and detail pages (UI)
- [ ] 5.6  Date survey UI
> **Checkpoint:** Admin runs date poll → creates meeting → members RSVP

## Phase 6: Email Reminders
- [ ] 6.1  Email service and templates
- [ ] 6.2  Cron scheduler for email reminders
> **Checkpoint:** Automated emails 7 days + 1 day before meetings

## Phase 7: Dashboard, Stats & Polish
- [ ] 7.1  Dashboard API
- [ ] 7.2  Dashboard UI (book of the month, cards, quick actions)
- [ ] 7.3  Stats API (club + personal)
- [ ] 7.4  Stats UI (charts, counters)
- [ ] 7.5  Admin database export
- [ ] 7.6  Playwright E2E test suite
- [ ] 7.7  Navigation, responsive polish, and final integration
> **Checkpoint:** Feature-complete, E2E tests pass, responsive on mobile
