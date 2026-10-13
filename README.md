# Brightcone People â€” Frontend

React 19 + Vite + TypeScript app for the Brightcone HR portal.

The API lives in [`brightcone-hr-backend`](https://github.com/koushikpranank/brightcone-hr-backend).

---

## Status: what actually works today

Sprint 1 is the only sprint built. The whole sign-in journey is real and tested â€”
not a mock.

| Sprint 1 module | State |
|---|---|
| 6.1 Design System | **Complete** â€” 15 components, design tokens, light and dark themes, responsive |
| 6.2 API client and login state | **Complete** â€” one fetch wrapper, silent refresh, session survives a reload, cross-tab sign-out |
| 6.2 Login screen | **Complete** â€” talks to the real login API, no demo accounts |
| 6.2 Logout and session expiry | **Complete** â€” including expiry while the tab sits idle |
| 6.2 Forgot and reset password screens | **Complete** |
| 6.3 App shell and route guards | **Complete** â€” sidebar, top bar, protected routes, forced password change |
| 6.3 Form, modal, drawer, toast and table kit | **Partial** â€” see the honest note below |

Sprint 1 ticket-by-ticket status is in [STATUS.md](STATUS.md).

### Pages that exist and work

| Path | Page | Notes |
|---|---|---|
| `/login` | Sign in | Real form validation, shows the server's message for a wrong password |
| `/forgot-password` | Request a reset link | Always confirms the same way, so it cannot reveal which emails exist |
| `/reset-password?token=â€¦` | Choose a new password | Refuses to render without a token |
| `/` | Home | **Placeholder** â€” greets you and lists your permissions. The real home (clock card, leave balances, to-dos) is a later sprint. |
| `/change-password` | Change password | Also serves as the forced "choose your own password" screen |
| anything else | 404 | |

### Ticket 6.3, honestly

The design-system ticket asks for forms, modals, drawers, toasts and tables.
**Only the form primitives are built.** What exists:

- Built and in use: `Button`, `TextField`, `PasswordField`, `Alert`, `Card`,
  `Spinner`, `Pill`, `Avatar`
- Built but not yet used by any page: `SelectField`, `TextareaField`, `Tabs`,
  `ProgressBar`, `StatTile`, `EmptyState`, `Skeleton`
- **Not built:** `FormModal`, `ConfirmDialog`, `Drawer`, `Toast`, `DataTable`

The backend declares five HR user-management endpoints and an audit-log endpoint
that this app has no code for yet. Those arrive with the screens that need them.

---

## Run it

### You need

- Node 20 or newer

### Then

```bash
npm install --legacy-peer-deps
cp .env.example .env.development
npm run dev
```

Open **http://localhost:5173**.

Start the backend first â€” see its README. Without it, sign-in will fail because
there is nothing to sign in to.

`--legacy-peer-deps` is needed because `openapi-typescript` still declares
TypeScript 5 as its peer dependency.

### Sign in

`npm run seed` in the backend repo prints 14 demo accounts and their passwords once.
An HR Admin, three managers, one finance user and nine employees.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server, port 5173, with `/api` proxied to the backend |
| `npm run build` | Type-check, then production build |
| `npm run typecheck` | TypeScript only |
| `npm run lint` / `npm run format` | oxlint and Prettier |
| `npm test` | Vitest â€” 16 unit tests |
| `npm run test:e2e` | Playwright â€” 5 end-to-end tests |
| `npm run gen:api` | Regenerate `src/api/schema.d.ts` from `openapi.json` |

`npm test` runs the whole suite. If a single file is enough while iterating:
`npx vitest run src/App.test.tsx`.

The e2e suite stubs the API at the network boundary, so it needs the dev server but
never a database. Install the browser once with `npx playwright install chromium`.

---

## How it is put together

```
src/main.tsx           Entry point. Applies the theme, creates the query client, mounts the app.
src/App.tsx            The route table.
src/theme.ts           Light/dark preference, stored in localStorage.
src/api/client.ts      The one place that talks to the backend.
src/api/auth.ts        The five auth endpoint wrappers.
src/api/schema.d.ts    Generated from openapi.json. Never edit by hand.
src/auth/              AuthContext (who is signed in) and RequireAuth (the route guard).
src/components/        The shared UI kit, the app shell, the auth layout.
src/routes/            Page components.
src/styles/            tokens.css (colours) and global.css (component styles).
src/test/              Test setup and the fetch mock helper.
e2e/                   Playwright tests.
```

### How a signed-in session works

This is the part worth understanding before changing anything.

1. **The access token lives in a JavaScript variable and nowhere else.** Not in
   `localStorage`, not in `sessionStorage`, not in a cookie. A reload forgets it,
   which is the point â€” an XSS payload cannot read it out of web storage. A test
   asserts this.
2. **The refresh token is an `HttpOnly` cookie** set by the backend, scoped to
   `/api/auth`. JavaScript cannot read it. The browser sends it automatically.
3. **On load, the app calls `POST /api/auth/refresh`.** That is how a reload becomes
   signed in again. The route guard shows a spinner until this settles, which is why
   `status` starts as `loading`.
4. **On any `401`, the client refreshes once and replays the request.** Concurrent
   `401`s share a single in-flight refresh rather than firing several. A `401` on
   `/api/auth/*` itself is never treated as expiry, so a wrong password cannot
   trigger a refresh loop.
5. **Signing out clears the cached data too.** `queryClient.clear()` runs on every
   sign-out and every expiry, so the next person at that computer cannot see the
   previous person's cached pages.
6. **Signing out in one tab signs out every tab,** through a `BroadcastChannel`.

### The design system

Colours are CSS custom properties in `src/styles/tokens.css`. Both themes are first
class: every one of the light tokens has a dark counterpart, and `color-scheme`
flips with it. Components only ever reference `var(--â€¦)`, so none of them knows
which theme is active.

Dark mode is applied as a `data-theme` attribute on `<html>` and remembered in
`localStorage`. It is applied before first paint, so there is no flash of the wrong
theme on reload.

Accessibility that is already handled: visible focus rings on everything
interactive, `role="alert"` on errors, `aria-invalid` and `aria-describedby` on
invalid fields, labelled form controls, a visually-hidden utility, and
`prefers-reduced-motion` honoured for the spinner and the loading animations.

The layout is responsive. Below 860px the sign-in page drops to one column and the
sidebar becomes an off-canvas drawer behind a Menu button.

---

## API contract

`openapi.json` is copied from the backend repo and is the contract between the two.
Types are generated from it:

```bash
# in the backend repo
make openapi
# copy openapi.json here, then:
npm run gen:api
```

`src/api/schema.d.ts` is generated. Never edit it by hand â€” CI fails if it drifts
from `openapi.json`.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch names, commit style and the
definition of done. Every pull request is checked automatically: types, lint, unit
tests and end-to-end tests. Broken code cannot reach `main`.