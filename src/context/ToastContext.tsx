import React, { createContext, useCallback, useContext, useState } from 'react'
import Toast from '../components/Toast'

type ToastContextValue = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)

  const showToast = useCallback((m: string) => {
    setMessage(m)
    // hide after 3s
    setTimeout(() => setMessage(null), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast message={message} />
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
