# Brightcone People Plus — Frontend

React 19, TypeScript and Vite client for Brightcone HR. The interface follows the supplied Brightcone People Plus design. A suite module is not necessarily backed by a live API: areas without a backend stay marked "Coming soon" and never show invented records.

## Current scope

- Sign in, password recovery and reset, silent session refresh, sign out, protected routes, theme, and a shared UI kit.
- Suite dashboard and navigation, live portal accounts (HR Admin), live audit log, and a dev-only UI-kit page.
- Every other module is a data-driven "Coming soon" page that names the phase and ticket that delivers its backend (see [docs/api-migration.md](docs/api-migration.md)).
- Access tokens live in memory only. The refresh token is an HttpOnly cookie that scripts cannot read.

## Run locally

Requirements: Node.js 20+ and the [Brightcone HR API](../brightcone-hr-backend) on port 5150.

```bash
npm ci --legacy-peer-deps
cp .env.example .env.development
npm run dev
```

Vite serves `http://localhost:5173` and proxies `/api` to the backend. All settings are read in one place, `src/config/env.ts`, and validated when the app starts; see `.env.example`. Never put secrets in `VITE_*` variables: they are bundled into browser code.

## Scripts

| Command                                 | What it does                                                        |
| --------------------------------------- | ------------------------------------------------------------------- |
| `npm run dev` / `build` / `preview`     | Dev server, production build, preview of the build                  |
| `npm run lint` / `format` / `typecheck` | oxlint, Prettier, TypeScript                                        |
| `npm test` / `test:e2e`                 | Vitest unit and component tests, Playwright browser tests           |
| `npm run gen:api`                       | Regenerate API types from `openapi.json` (copy it from the backend) |
| `npm run check`                         | All four structure checks below                                     |
| `check:lines`                           | No source file over 400 lines                                       |
| `check:names`                           | File and folder naming conventions                                  |
| `check:css`                             | No CSS class that nothing uses                                      |
| `check:dead`                            | [knip](https://knip.dev): unused files, exports and dependencies    |

CI runs lint, `npm run check`, format check, type check, tests, build and the dependency audit on every pull request.

## Structure

```text
src/
  main.tsx, App.tsx     providers and the app below them
  config/               env.ts: the only reader of import.meta.env
  api/                  fetch client, typed endpoint helpers, generated contract types
  auth/                 session state and route guards
  domain/               pure business logic, no React (money, dates, permissions, status, ...)
  features/<module>/    one folder per product area: pages, hooks, api calls, feature CSS
  components/           shared UI kit (components/ui/) and layout parts
  people-plus/          suite shell: sidebar, top bar, app launcher, navigation config
  routes/               route-table.tsx (every URL in one table) and the 404 page
  lib/                  small cross-cutting helpers (error reporting)
  styles/               design tokens and global styles
  test/                 test setup and the fake API
scripts/                CI checks and the API type splitter
e2e/                    Playwright tests
docs/                   architecture, API migration plan
```

Rule of thumb: rules live in `domain/`, server calls in `features/*/api.ts` or `api/`, and components only render. See [docs/architecture.md](docs/architecture.md).

## Adding a module

1. Create `src/features/<module>/` with the page, an `api.ts` (typed from `openapi.json`) and tests.
2. Point its route in `src/routes/route-table.tsx` at the page and remove its line from `features/modules/modules.ts`.
3. Update the status in [docs/api-migration.md](docs/api-migration.md).

See [CONTRIBUTING.md](CONTRIBUTING.md) for naming, branches and review rules, and `STATUS.md` for the current branch status.
