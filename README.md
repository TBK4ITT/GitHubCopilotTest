# My Login Page

[![E2E Tests](https://github.com/TBK4ITT/GitHubCopilotTest/actions/workflows/e2e.yml/badge.svg)](https://github.com/TBK4ITT/GitHubCopilotTest/actions/workflows/e2e.yml)

> Replace `TBK4ITT/GitHubCopilotTest` in the badge URL above with your `OWNER/REPO` to show your workflow status.

Simple React + TypeScript example with a login page, validations, a **mock** API (for demo only — do not use in production), and unit tests (Vitest + React Testing Library).

**Scripts:**

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm test` — run unit tests
- `npm run test:watch` — unit tests in watch mode
- `npm run test:coverage` — unit tests with coverage report
- `npm run test:e2e` — Playwright E2E tests
- `npm run lint` — run ESLint
- `npm run lint:fix` — ESLint with auto-fix
- `npm run format` — format code with Prettier

## End-to-end (E2E) tests

Playwright E2E tests run on push and pull requests to `main` via `.github/workflows/e2e.yml`.

**Run E2E locally:**

```bash
npx playwright install --with-deps
npm run dev   # in one terminal
npm run test:e2e   # in another
```

The CI workflow builds the app, starts the preview server, runs E2E tests, and uploads the Playwright HTML report as an artifact.

You can toggle dev-only simulated server failures at `/__dev__` to exercise failure and rate-limit flows.

**Sample credentials (mock only):**

- email: `test@example.com`
- password: `Password1`
