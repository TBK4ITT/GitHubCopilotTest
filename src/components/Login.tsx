import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authenticate } from '../api/auth'
import { useUser } from '../context/UserContext'

type FormState = {
  email: string
  password: string
}

export default function Login() {
  const [form, setForm] = useState<FormState>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setUser } = useUser()

  const validate = (): boolean => {
    const next: Partial<FormState> = {}
    if (!form.email) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email is invalid'

    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validate()) return

    setLoading(true)
    try {
      const res = await authenticate(form.email, form.password)
      if (res.ok) {
        // persist user in context (which also persists to localStorage)
        if (res.user) setUser(res.user)
        navigate('/home')
      } else {
        setMessage(res.message || 'Invalid credentials')
      }
    } catch (err) {
      setMessage('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="login-form" className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        />
        {errors.email && <div className="error">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
        />
        {errors.password && <div className="error">{errors.password}</div>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      {message && <div role="status" className="message">{message}</div>}
    </form>
  )
} 
