import { test, expect } from '@playwright/test'

test('login -> edit profile -> success', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message, e.stack));
  await page.goto('/')
  console.log('PAGE HTML:', await page.content())
  await page.waitForSelector('form[aria-label="login-form"]')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('Password1')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByText('Welcome, Test User!')).toBeVisible()

  // Navigate to profile
  await page.getByText('Profile').click()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()

  // Edit fields
  await page.getByLabel('Name').fill('E2E User')
  await page.getByLabel('Email').fill('e2e@example.com')
  await page.getByRole('button', { name: 'Save' }).click()

  // Toast
  await expect(page.locator('text=Profile updated')).toBeVisible()

  // localStorage should be updated
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('user') || '{}'))
  expect(stored.email).toBe('e2e@example.com')
})

test('dev simulate failNext triggers rollback', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message, e.stack));
  // ensure a clean state
  await page.goto('/')
  await page.waitForSelector('form[aria-label="login-form"]')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('Password1')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Welcome, Test User!')).toBeVisible()

  // set failNext directly (avoid UI flakiness) by exposing the simulate object on window
  await page.evaluate(async () => {
    const m = await import('/src/api/user')
    ;(window as any).__simulate = m.simulate
    ;(window as any).__simulate.failNext = true
    ;(window as any).__simulate.requestCounts = {}
  })
  console.log('SIMULATE AFTER DIRECT SET:', await page.evaluate(() => (window as any).__simulate && (window as any).__simulate.failNext))

  // instrument updateProfile to log calls/results
  await page.evaluate(async () => {
    const m = await import('/src/api/user')
    const orig = m.updateProfile
    m.updateProfile = async (u) => {
      console.log('DEBUG: updateProfile called with', u)
      const res = await orig(u)
      console.log('DEBUG: updateProfile result', res)
      return res
    }
  })

  // navigate to profile using in-app navigation (preserves window state) and attempt update
  await page.getByText('Profile').click()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await page.getByLabel('Email').fill('newfail@example.com')
  await page.getByRole('button', { name: 'Save' }).click()

  console.log('PROFILE HTML AFTER SAVE:', await page.content())

  // should show error and rollback
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

  // setup rate limit to 1 (set directly to avoid cross-module instance issues)
  console.log('USER IN STORAGE AFTER LOGIN:', await page.evaluate(() => localStorage.getItem('user')))
  await page.evaluate(async () => {
    const m = await import('/src/api/user')
    ;(window as any).__simulate = m.simulate
    ;(window as any).__simulate.rateLimitPerId = 1
    ;(window as any).__simulate.requestCounts = {}
  })
  console.log('SIM RATE SET DIRECTLY:', await page.evaluate(() => (window as any).__simulate && (window as any).__simulate.rateLimitPerId))

  // first save should succeed (navigate via in-app link to preserve window state)
  await page.getByText('Profile').click()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await page.getByLabel('Email').fill('first@example.com')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('text=Profile updated')).toBeVisible()
  console.log('REQUESTS AFTER FIRST SAVE:', await page.evaluate(() => (window as any).__simulate && (window as any).__simulate.requestCounts))

  // second save should fail due to rate limit and rollback
  await page.getByLabel('Email').fill('second@example.com')
  await page.getByRole('button', { name: 'Save' }).click()
  console.log('REQUESTS AFTER SECOND SAVE:', await page.evaluate(() => (window as any).__simulate && (window as any).__simulate.requestCounts))
  await expect(page.locator('text=Rate limit exceeded')).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveValue('first@example.com')
})