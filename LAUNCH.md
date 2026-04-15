# Launch Readiness and Rollback Plan

## Status

**Current recommendation: do not deploy to production yet.**

The application is significantly more hardened and now passes lint, typecheck, package builds, unit/integration tests, and high/critical audit checks. However, the current end-to-end suite is still failing, and the root `npm run build` script is only a placeholder rather than a real release build.

## Verification Summary

### Passing

- `npm run lint`
- `npm run build --workspace @book-club/server`
- `npm run build --workspace @book-club/client`
- `npm test`
- `npm audit --audit-level=high` → no high/critical findings
- Health check available at `/api/health`

### Failing / Blocked

- `npm run e2e`
  - `login page renders` passes
  - remaining flows fail because the expected UI controls/pages are not present or not wired as the Playwright tests expect
- Root `npm run build`
  - currently prints a placeholder message instead of running the actual workspace builds

## Pre-Launch Checklist

### Code Quality

- [x] All unit/integration tests pass
- [ ] E2E tests pass
- [x] Lint passes
- [x] Server typecheck/build passes
- [x] Client production build passes
- [x] Code reviewed and security-hardened
- [ ] Root build command should be updated to run real builds

### Security

- [x] No high/critical `npm audit` findings
- [x] Input validation added across user-facing routes with Zod
- [x] Authentication and authorization checks in place
- [x] Security headers configured with Helmet
- [x] Rate limiting configured for auth and API routes
- [x] CSRF protection added for state-changing requests
- [ ] Explicit production CORS policy still needs to be confirmed if deployed cross-origin
- [ ] Remaining moderate dev-tooling audit issue documented below

### Infrastructure

- [x] Health check exists
- [ ] Production env vars must be verified at deploy time
- [ ] Logging/error reporting destination still needs to be configured for production
- [ ] Deployment procedure should use package-level builds until root build is fixed

### Documentation

- [x] Launch readiness and rollback plan documented here
- [ ] README should be updated to reflect the real production build commands

## Known Remaining Risk

### Moderate audit finding

`npm audit --audit-level=high` still reports a **moderate** vulnerability in the `drizzle-kit` → `esbuild` dev-tooling chain.

Assessment:
- dev-tooling path, not app runtime path
- not a high/critical blocker for release
- should still be reviewed during dependency maintenance

Recommended follow-up:
- evaluate upgrading `drizzle-kit` in a dedicated dependency update change
- retest migrations and local database workflows after upgrade

## Why E2E is currently blocked

The Playwright suite expects user-facing forms and flows that are not yet available in the current UI implementation, including:
- admin user creation form labels and controls
- book creation controls on the books page
- survey creation UI fields
- meeting creation form and RSVP flow wiring
- some seeded content/links expected by tests

This appears to be a product completeness gap rather than a new regression from the hardening work.

## Release Recommendation

### Safe to do now

- merge and keep the current security hardening in production branches
- deploy to a staging environment
- run manual smoke tests on auth, admin export, books, surveys, and meetings APIs

### Required before production launch

1. Fix or align the E2E suite with the implemented UI
2. Replace the root `npm run build` placeholder with a real monorepo build command
3. Confirm production logging/error reporting destination
4. Confirm production CORS/origin policy
5. Run a final staging smoke test with production-like environment settings

## Deployment Commands

Until the root build script is fixed, use:

```bash
npm run lint
npm run build --workspace @book-club/server
npm run build --workspace @book-club/client
npm test
npm run e2e
```

## Rollback Plan

### Trigger Conditions

Rollback immediately if any of the following occur after deployment:
- error rate rises above 2x baseline
- p95 latency rises above 50% over baseline
- auth/login/logout failures spike
- CSRF failures appear on valid client requests
- admin export flow fails for valid admin users
- data integrity issues appear in survey, meeting, or user-management flows
- a security issue is discovered

### Rollback Steps

1. Revert the latest release commit(s)

```bash
git revert <commit>
git push origin main
```

For the current hardening change already pushed earlier, the main release hardening commit is:

```text
b9cc95d
```

2. Rebuild/redeploy the previous known-good version
3. Verify rollback with:
   - `/api/health`
   - login/logout flow
   - a protected API route
   - admin export confirmation flow
4. Notify stakeholders that rollback occurred and why

### Expected Rollback Time

- git revert + push: 1–3 minutes
- redeploy previous version: 3–10 minutes
- verification: 5–10 minutes

## First-Hour Post-Deploy Checks

1. Confirm `/api/health` returns 200
2. Test login and logout manually
3. Test one admin-only flow
4. Confirm no new server error types in logs
5. Check auth and API latency
6. Check admin export confirm/download flow
7. Confirm client loads and protected routing still works

## Conclusion

The codebase is **materially closer to launch-ready** after the security and validation work, but it should **not be called production-ready yet** until the E2E and root-build gaps are closed.
