import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Exclude Playwright E2E tests from Vitest runs
    exclude: ['**/e2e/**', '**/playwright.config.*'],
    environment: 'jsdom',
  },
})
