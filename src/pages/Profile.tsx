import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { useToast } from '../context/ToastContext'
import { updateProfile } from '../api/user'
import { validateEmail } from '../utils/validation'

export default function Profile() {
  const { user, setUser } = useUser()
  const { showToast } = useToast()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [errors, setErrors] = useState<{ name?: string; email?: string; form?: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  if (!user) {
    return null
  }

  const validate = () => {
    const next: { name?: string; email?: string } = {}
    if (!name.trim()) next.name = 'Name is required'
    const emailErr = validateEmail(email)
    if (emailErr) next.email = emailErr
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const updated: typeof user = { ...user, name: name.trim(), email: email.trim() }

    // optimistic update
    const prev = user
    setUser(updated)
    setName(updated.name)
    setEmail(updated.email)
    setIsSaving(true)
    setErrors({})

    try {
      const res = await updateProfile(updated)
      if (!res.ok) {
        // rollback
        setUser(prev || null)
        setName(prev?.name || '')
        setEmail(prev?.email || '')
        setErrors((prevErr) => ({ ...prevErr, form: res.message }))
        setIsSaving(false)
        return
      }
      setUser(res.user!)
      showToast('Profile updated')
    } catch (err) {
      setUser(prev || null)
      setName(prev?.name || '')
      setEmail(prev?.email || '')
      setErrors((prevErr) => ({ ...prevErr, form: 'Save failed' }))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="app-container">
      <h1>Profile</h1>
      {errors.form && <div className="error">{errors.form}</div>}
      <form onSubmit={handleSave} className="login-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        <button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  )
}