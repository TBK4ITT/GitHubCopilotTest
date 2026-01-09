# My Login Page

[![E2E Tests](https://github.com/<OWNER>/<REPO>/actions/workflows/e2e.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/e2e.yml)

> Replace `<OWNER>/<REPO>` in the badge URL above with your repository path to display the workflow status.

Simple React + TypeScript example with a login page, validations, a mock API, and unit tests (Vitest + React Testing Library).

Scripts:
- npm run dev
- npm run build
- npm run preview
- npm test
- npm run test:watch
- npm run test:e2e  # Playwright E2E tests

## End-to-end (E2E) tests

This project includes Playwright E2E tests and a GitHub Actions workflow that runs them on push and pull requests to `main`.

- Run E2E tests locally:

```bash
# install browsers (if not already installed)
npx playwright install --with-deps

# start dev server in a terminal
npm run dev

# in another terminal run the tests
npm run test:e2e
```

- The workflow file is at `.github/workflows/e2e.yml` and will:
  - install dependencies and Playwright browsers
  - build and start a preview server
  - run `npx playwright test` and upload an HTML report (`playwright-report`) as an artifact

You can also toggle dev-only simulated server failures at `/__dev__` to exercise failure and rate-limit flows in the E2E tests.

Sample credentials:
- email: test@example.com
- password: Password1
