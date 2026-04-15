# Launch Readiness and Rollback Plan

## Status

**Current recommendation: not fully production-ready yet, but the previous release blockers are closed.**

The application now passes lint, the real root build, package builds, unit/integration tests, end-to-end tests, and high/critical audit checks. Remaining work is operational rather than build/test correctness: production logging/error reporting configuration, explicit production CORS confirmation if deployed cross-origin, and final staging verification.

## Verification Summary

### Passing

- `npm run lint`
- `npm run build`
- `npm run build --workspace @book-club/server`
- `npm run build --workspace @book-club/client`
- `npm test`
- `npm run e2e`
- `npm audit --audit-level=high` → no high/critical findings
- Health check available at `/api/health`

### Remaining Non-Code Blockers

- production logging/error reporting destination still needs to be configured
- explicit production CORS/origin policy still needs confirmation if deployed cross-origin
- final staging smoke test still needs to be performed

## Pre-Launch Checklist

### Code Quality

- [x] All unit/integration tests pass
- [x] E2E tests pass
- [x] Lint passes
- [x] Root build passes
- [x] Server typecheck/build passes
- [x] Client production build passes
- [x] Code reviewed and security-hardened

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
- [x] Root build is now suitable for the deployment procedure
- [ ] Production env vars must be verified at deploy time
- [ ] Logging/error reporting destination still needs to be configured for production
- [ ] Final staging smoke test still needs to be performed

### Documentation

- [x] Launch readiness and rollback plan documented here
- [x] README updated to reflect the real build and e2e commands

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

## E2E Notes

The Playwright suite now passes. The fixes required:
- deterministic E2E startup ports
- avoiding shell/runtime drift during E2E startup
- waiting for async create flows to finish before switching users in Playwright
- rebuilding the native SQLite dependency for the local runtime

## Release Recommendation

### Safe to do now

- merge and keep the current security hardening in production branches
- deploy to a staging environment
- run manual smoke tests on auth, admin export, books, surveys, and meetings APIs

### Required before production launch

1. Confirm production logging/error reporting destination
2. Confirm production CORS/origin policy
3. Run a final staging smoke test with production-like environment settings

## Deployment Commands

Use:

```bash
npm run lint
npm run build
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

The previous code/test release blockers are now closed. The codebase still needs final production operations setup and staging verification before it should be called fully production-ready.
