import { User } from '../types/user'
import { isValidEmail } from '../utils/validation'

const STORAGE_KEY = 'profiles'

const delay = (ms = 200) => new Promise((res) => setTimeout(res, ms))

export const simulate = {
  // When true, the next call will fail with a deterministic message.
  failNext: false,
  // Fraction 0..1 of random failures (set in tests to 1 to always fail)
  failRate: 0,
  // Allow only N requests per user id; additional requests return rate limit error
  rateLimitPerId: 0,
  requestCounts: {} as Record<string, number>,
  reset() {
    this.failNext = false
    this.failRate = 0
    this.rateLimitPerId = 0
    this.requestCounts = {}
  },
}


function readProfiles(): Record<string, User> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, User>
  } catch {
    return {}
  }
}

function writeProfiles(profiles: Record<string, User>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

export async function updateProfile(user: User): Promise<{ ok: boolean; user?: User; message?: string }> {
  await delay()

  // allow tests to inject a different simulate object via globalThis
  const S: typeof simulate = ((globalThis as any).simulate as typeof simulate) || simulate

  // deterministic failure for testing
  if (S.failNext) {
    S.failNext = false
    return { ok: false, message: 'Simulated failure' }
  }

  // random failures by rate
  if (S.failRate > 0 && Math.random() < S.failRate) {
    return { ok: false, message: 'Random failure' }
  }

  // server-side validation
  if (!user.name || !user.name.trim()) return { ok: false, message: 'Name required' }
  if (!user.email || !isValidEmail(user.email)) return { ok: false, message: 'Email invalid' }

  // rate limit per user id
  if (S.rateLimitPerId > 0) {
    S.requestCounts[user.id] = (S.requestCounts[user.id] || 0) + 1
    if (S.requestCounts[user.id] > S.rateLimitPerId) {
      return { ok: false, message: 'Rate limit exceeded' }
    }
  }

  const profiles = readProfiles()

  // simulate unique email constraint
  const duplicate = Object.values(profiles).find((p) => p.email === user.email && p.id !== user.id)
  if (duplicate) return { ok: false, message: 'Email already in use' }

  profiles[user.id] = { ...user }
  writeProfiles(profiles)

  return { ok: true, user }
}

export async function fetchProfile(id: string): Promise<{ ok: boolean; user?: User; message?: string }> {
  await delay()
  const profiles = readProfiles()
  const user = profiles[id]
  if (!user) return { ok: false, message: 'Not found' }
  return { ok: true, user }
}
