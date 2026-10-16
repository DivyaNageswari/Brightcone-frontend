# Brightcone People Plus — Frontend

React 19, TypeScript, and Vite client for Brightcone HR. The interface follows the supplied Brightcone People Plus design. A visual suite module is not necessarily backed by a live API: unsupported business areas must remain marked “Coming soon” rather than showing fabricated records.

## Current scope

- Sign in, password recovery/reset, session refresh/logout, protected app shell, theme, and reusable UI components.
- People Plus navigation and dashboard shell, audit screen, and UI kit.
- Live API calls are centralized in `src/api` and use the backend API. Access tokens remain in memory; refresh uses an HttpOnly cookie.
- Payroll, leave, expenses, recruitment, documents/approvals, learning, shift, and other HR data features are not complete end-to-end. Check the backend API contract before adding a UI flow.

## Run locally

Requirements: Node.js/npm and the [Brightcone HR API](../brightcone-hr-backend) running on port 5150.

```powershell
npm ci
Copy-Item .env.example .env.development
npm run dev
```

Vite serves the app at `http://localhost:5173`, proxies `/api` to `http://localhost:5150`, and uses `/api` as the browser API base. Adjust `VITE_PROXY_TARGET` only when the backend runs elsewhere. Never put secrets in `VITE_*` variables; they are bundled into browser code.

## Verification

```powershell
npm run lint
npm test
npm run build
npm run test:e2e
```

Current local verification: lint passed, unit tests passed (2 files, 16 tests), production build passed. Playwright E2E did not complete in the audit environment. It stubs the API and does not prove backend integration.

## Structure

```text
src/app entry and router
src/api API client and generated contract types
src/auth auth state and route guards
src/components shared UI and application shell
src/features domain feature modules
src/people-plus suite-specific layout/navigation
src/routes route-level pages
src/styles design tokens and global styles
e2e browser tests
```

See `STATUS.md` for branch tasks and the backend repository’s `PROJECT_ASSESSMENT.md` for API, schema, security and release readiness.
