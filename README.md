# Brightcone People: Frontend

React + Vite + TypeScript app for the Brightcone HR portal. The backend lives in `brightcone-hr-backend`.

## Run it in 5 minutes

```bash
npm install --legacy-peer-deps
cp .env.example .env.development
npm run dev
```

Open http://localhost:5173. The page shows the backend health result. Start the backend first (see its README); without it the page shows "Server unreachable".

`--legacy-peer-deps` is needed because `openapi-typescript` still declares TypeScript 5 as its peer.

## Scripts

| Command                                    | What it does                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| `npm run dev`                              | Dev server with `/api` proxied to the backend                                  |
| `npm run build`                            | Type-check and production build                                                |
| `npm run lint` / `format` / `format:check` | oxlint and Prettier                                                            |
| `npm run typecheck`                        | TypeScript only                                                                |
| `npm test`                                 | Vitest unit tests                                                              |
| `npm run test:e2e`                         | Playwright tests                                                               |
| `npm run gen:api`                          | Regenerate API types from `openapi.json` (copy it from the backend repo first) |

## Folders

```
src/api/         API client and generated types
src/auth/        login state, route guards
src/components/  shared UI parts
src/features/    one folder per area (leave/, payroll/ ...)
src/routes/      page components, loaded lazily
src/styles/      tokens.css (colours), global.css
e2e/             Playwright tests
```

## Rules

See [CONTRIBUTING.md](CONTRIBUTING.md).
