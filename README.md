# Book Club Manager

A self-hosted web application for running a small book club.

## Overview

Book Club Manager is being built to help a club manage its full workflow in one place:

- member access via Google SSO
- book history and current reading pipeline
- wishlist suggestions and book voting
- meeting scheduling and date surveys
- RSVP tracking and reminder emails
- club and personal reading stats
- SQLite database export for backups

## Project Status

This project is in active implementation with the core v1 workflows now working end-to-end.

Completed so far:

- finalized product specification
- finalized implementation plan and task list
- monorepo workspace scaffolding
- shared linting and formatting tooling
- Express server with health endpoint
- Vite React client shell and protected app layout
- shared TypeScript domain types and constants
- Drizzle + SQLite database setup
- backend/frontend test setup with Vitest
- Playwright E2E coverage for core admin/member flows
- security hardening for sessions, CSRF, headers, rate limiting, and route validation
- working admin flows for user management, books, surveys, meetings, and DB export

## Tech Stack

- **Frontend:** React, Vite, React Router, TanStack Query, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** SQLite, Drizzle ORM, better-sqlite3
- **Testing:** Vitest, Testing Library, supertest
- **Tooling:** npm workspaces, ESLint, Prettier

## Monorepo Structure

```text
packages/
  client/   # React frontend
  server/   # Express backend
  shared/   # Shared TypeScript types and constants
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install dependencies

```bash
npm install
```

### Environment setup

Copy the example environment file and adjust values as needed:

```bash
cp .env.example .env
```

### Run the database migration

```bash
npm run db:migrate
```

### Start the app in development

```bash
npm run dev
```

Expected local ports:

- Client: `http://localhost:5173`
- Server: `http://localhost:3000`

### Run tests

```bash
npm test
```

## Available Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run format:check
npm test
npm run e2e
npm run db:migrate
npm run db:smoke
```

## Notes

- The specification lives in `SPEC.md`.
- The implementation plan lives in `tasks/plan.md`.
- The task checklist lives in `tasks/todo.md`.
- Launch readiness and rollback notes live in `LAUNCH.md`.

## License

Currently unlicensed / private project.
