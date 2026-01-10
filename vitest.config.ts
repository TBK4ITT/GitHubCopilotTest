import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Only run unit tests in `src/` and exclude e2e and node_modules
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/e2e/**', '**/playwright.config.*', 'node_modules/**'],
    environment: 'jsdom',
    globals: true,
  },
})
