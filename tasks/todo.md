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
- [x] 4.1  Wishlist API and UI
- [x] 4.2  Book survey database schema
- [x] 4.3  Book survey API (create, ranked vote, close, scoring)
- [x] 4.4  Book survey UI (voting interface, results)
> **Checkpoint:** User suggests book → admin creates poll → members vote → winner to pipeline

## Phase 5: Meetings, Date Surveys & RSVP
- [x] 5.1  Meeting and date survey database schema
- [x] 5.2  Meeting CRUD API
- [x] 5.3  RSVP API
- [x] 5.4  Date survey API
- [x] 5.5  Meeting list and detail pages (UI)
- [x] 5.6  Date survey UI
> **Checkpoint:** Admin runs date poll → creates meeting → members RSVP

## Phase 6: Email Reminders
- [x] 6.1  Email service and templates
- [x] 6.2  Cron scheduler for email reminders
> **Checkpoint:** Automated emails 7 days + 1 day before meetings

## Phase 7: Dashboard, Stats & Polish
- [x] 7.1  Dashboard API
- [x] 7.2  Dashboard UI (book of the month, cards, quick actions)
- [x] 7.3  Stats API (club + personal)
- [x] 7.4  Stats UI (charts, counters)
- [x] 7.5  Admin database export
- [x] 7.6  Playwright E2E test suite
- [x] 7.7  Navigation, responsive polish, and final integration
- [x] 7.8  Security hardening, launch-readiness verification, and E2E/build stabilization
- [x] 7.9  Admin onboarding and UX polish pass (success feedback, first-steps guidance, copy consistency)
- [x] 7.10 Shared toast feedback, post-create shortcuts, and member UX polish pass
- [ ] 7.11 Airy Editorial design token system and page-by-page redesign implementation
  - [ ] 7.11.1 Define cool-editorial theme tokens and light shell primitives
  - [ ] 7.11.2 Redesign login page to establish the new visual language
  - [ ] 7.11.3 Redesign dashboard page with stronger editorial hierarchy
  - [ ] 7.11.4 Redesign books page as a typography-led catalog
  - [ ] 7.11.5 Redesign book detail page
  - [ ] 7.11.6 Redesign meetings and surveys pages
  - [ ] 7.11.7 Redesign wishlist and admin utility pages
> **Checkpoint:** Feature-complete, E2E tests pass, responsive on mobile

## Phase 8: Auth Migration — Email + Password
- [ ] 8.1 User credential and reset-token schema changes
- [ ] 8.2 Server-side password auth and session flow
- [ ] 8.3 Invite and forgot-password flows
- [ ] 8.4 Admin user management updates
- [ ] 8.5 Login and reset UI
- [ ] 8.6 End-to-end auth migration verification
> **Checkpoint:** Google auth removed, invite/reset email-password login works end-to-end
