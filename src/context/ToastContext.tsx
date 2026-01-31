import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import Toast from '../components/Toast'

type ToastContextValue = {
  showToast: (message: string) => void
}

const TOAST_DURATION_MS = 3000

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((m: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setMessage(m)
    timeoutRef.current = setTimeout(() => {
      setMessage(null)
      timeoutRef.current = null
    }, TOAST_DURATION_MS)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
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
