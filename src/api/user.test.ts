import { updateProfile, simulate } from './user'

beforeEach(() => {
  localStorage.clear()
  simulate.reset()
})

test('updateProfile saves a valid profile', async () => {
  const user = { id: '1', name: 'Alice', email: 'alice@example.com' }
  const res = await updateProfile(user)
  expect(res.ok).toBe(true)
  expect(res.user).toEqual(user)
  const profiles = JSON.parse(localStorage.getItem('profiles') || '{}')
  expect(profiles['1'].email).toBe('alice@example.com')
})

test('updateProfile rejects invalid email and missing name', async () => {
  const user1 = { id: '1', name: '', email: 'bad' }
  const res1 = await updateProfile(user1)
  expect(res1.ok).toBe(false)
  expect(res1.message).toBe('Name required')

  const user2 = { id: '1', name: 'Bob', email: 'bad' }
  const res2 = await updateProfile(user2)
  expect(res2.ok).toBe(false)
  expect(res2.message).toBe('Email invalid')
})

test('updateProfile enforces unique email constraint', async () => {
  // existing other profile
  localStorage.setItem('profiles', JSON.stringify({ '2': { id: '2', name: 'Other', email: 'other@example.com' } }))
  const user = { id: '1', name: 'Alice', email: 'other@example.com' }
  const res = await updateProfile(user)
  expect(res.ok).toBe(false)
  expect(res.message).toBe('Email already in use')
})

test('simulate.failNext causes a deterministic failure', async () => {
  simulate.failNext = true
  const user = { id: '1', name: 'Alice', email: 'alice@example.com' }
  const res = await updateProfile(user)
  expect(res.ok).toBe(false)
  expect(res.message).toBe('Simulated failure')
})

test('rate limit is enforced per user', async () => {
  simulate.rateLimitPerId = 1
  const user = { id: '1', name: 'Alice', email: 'alice@example.com' }
  const res1 = await updateProfile(user)
  expect(res1.ok).toBe(true)
  // second call should exceed the rate
  const res2 = await updateProfile(user)
  expect(res2.ok).toBe(false)
  expect(res2.message).toBe('Rate limit exceeded')
})