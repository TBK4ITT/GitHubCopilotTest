import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useToast } from '../context/ToastContext'

export default function NavBar() {
  const { user, setUser } = useUser()
  const navigate = useNavigate()
  const { showToast } = useToast()

  if (!user) return null

  const handleLogout = () => {
    setUser(null)
    showToast('Logged out')
    navigate('/')
  }

  const handleProfile = () => {
    navigate('/profile')
  }

  return (
    <nav className="nav">
      <div className="nav-left">Welcome, {user.name ?? user.email}</div>
      <div className="nav-right">
        <button type="button" onClick={handleProfile}>Profile</button>
        <button type="button" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}
