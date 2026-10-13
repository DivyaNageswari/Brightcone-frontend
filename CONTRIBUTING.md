# Contributing

## Branches and commits

- Branch from `main`: `feature/P1-17-login-screen`, `fix/P1-17-lockout-message`.
- Start each commit message with the ticket ID: `P1-17: add login form`.
- Open a pull request that says `Closes #<issue number>`. `main` is protected: one approval and green CI are required.

## Rules

- The browser is never trusted. Hiding a button is for comfort; the server is the real guard.
- Never store tokens in `localStorage`, `sessionStorage` or URLs.
- Never use `dangerouslySetInnerHTML`.
- Every list needs loading, empty and error states.
- Money is shown from paise integers using `Intl.NumberFormat('en-IN')`.

## Commands

`npm run lint` · `npm run format` · `npm run typecheck` · `npm test` · `npm run test:e2e` · `npm run gen:api`
