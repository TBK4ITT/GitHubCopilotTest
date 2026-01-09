import type { User } from '../types/user'

const sampleUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
}

export async function authenticate(email: string, password: string): Promise<{ ok: boolean; user?: User; message?: string }> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 250))

  // Very naive validation against sample credentials
  if (email === 'test@example.com' && password === 'Password1') {
    return { ok: true, user: sampleUser }
  }

  return { ok: false, message: 'Invalid email or password' }
}
