import { test, expect } from '@playwright/test'

// ensure a simulate object is present before the app loads in every test
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.simulate = {
      failNext: false,
      failRate: 0,
      rateLimitPerId: 0,
      requestCounts: {},
      reset() {
        this.failNext = false
        this.failRate = 0
        this.rateLimitPerId = 0
        this.requestCounts = {}
      },
    }
  })
})

test('login -> edit profile -> success', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('form[aria-label="login-form"]')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('Password1')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByText('Welcome, Test User!')).toBeVisible()

  await page.getByText('Profile').click()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()

  await page.getByLabel('Name').fill('E2E User')
  await page.getByLabel('Email').fill('e2e@example.com')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.locator('text=Profile updated')).toBeVisible()

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('user') || '{}'))
  expect(stored.email).toBe('e2e@example.com')
})

test('dev simulate failNext triggers rollback', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('form[aria-label="login-form"]')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('Password1')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Welcome, Test User!')).toBeVisible()

  await page.evaluate(() => {
    window.simulate.failNext = true
    window.simulate.requestCounts = {}
  })

  await page.getByText('Profile').click()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await page.getByLabel('Email').fill('newfail@example.com')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.locator('text=Simulated failure')).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveValue('test@example.com')
})

test('dev simulate rate limit enforces limit and rollbacks', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('form[aria-label="login-form"]')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('Password1')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Welcome, Test User!')).toBeVisible()

  await page.evaluate(() => {
    window.simulate.rateLimitPerId = 1
    window.simulate.requestCounts = {}
  })

  await page.getByText('Profile').click()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await page.getByLabel('Email').fill('first@example.com')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('text=Profile updated')).toBeVisible()

  await page.getByLabel('Email').fill('second@example.com')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('text=Rate limit exceeded')).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveValue('first@example.com')
})
