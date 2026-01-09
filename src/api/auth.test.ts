import { describe, expect, test } from 'vitest'
import { authenticate } from './auth'

describe('authenticate', () => {
  test('returns ok for sample credentials', async () => {
    const res = await authenticate('test@example.com', 'Password1')
    expect(res.ok).toBe(true)
    expect(res.user).toBeDefined()
    expect(res.user!.email).toBe('test@example.com')
  })

  test('returns false for invalid credentials', async () => {
    const res = await authenticate('x@example.com', 'nope')
    expect(res.ok).toBe(false)
    expect(res.user).toBeUndefined()
    expect(res.message).toBe('Invalid email or password')
  })
})