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

  await expect(page.locator('text=Welcome')).toBeVisible()

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
  // ensure a clean state
  await page.goto('/')
  await page.waitForSelector('form[aria-label="login-form"]')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('Password1')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator('text=Welcome')).toBeVisible()

  // reset simulation
  await page.goto('/__dev__')
  await page.getByTestId('dev-reset').click()
  // set failNext
  await page.getByTestId('dev-failNext').check()
  await page.getByTestId('dev-apply').click()

  // go to profile and attempt update
  await page.goto('/profile')
  await page.getByLabel('Email').fill('newfail@example.com')
  await page.getByRole('button', { name: 'Save' }).click()

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

  // setup rate limit to 1
  await page.goto('/__dev__')
  await page.getByTestId('dev-reset').click()
  await page.getByTestId('dev-rateLimit').fill('1')
  await page.getByTestId('dev-apply').click()

  // first save should succeed
  await page.goto('/profile')
  await page.getByLabel('Email').fill('first@example.com')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('text=Profile updated')).toBeVisible()

  // second save should fail due to rate limit and rollback
  await page.getByLabel('Email').fill('second@example.com')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('text=Rate limit exceeded')).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveValue('first@example.com')
})