import React, { createContext, useContext, useState } from 'react'
import type { User } from '../types/user'

type UserContextValue = {
  user: User | null
  setUser: (u: User | null) => void
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })

  const setUserAndPersist = (u: User | null) => {
    setUser(u)
    if (typeof window !== 'undefined') {
      if (u) localStorage.setItem('user', JSON.stringify(u))
      else localStorage.removeItem('user')
    }
  }

  return <UserContext.Provider value={{ user, setUser: setUserAndPersist }}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
